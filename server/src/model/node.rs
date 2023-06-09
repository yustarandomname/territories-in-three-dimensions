use oorandom::Rand32;
use serde::{Deserialize, Serialize};
use std::f32::consts::E;

use super::{
    neighbour_data::{NeighbourAgentsOut, NeighbourIndeces},
    utils::{
        dimensions::Dims,
        hyper_params::HyperParams,
        species::{AgentSpecies, SpeciesGraffiti, SpeciesPushStrength},
    },
    SubNode,
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Node {
    pub index: u32,
    pub neighbours: NeighbourIndeces,       // indices of neighbours
    pub graffiti: SpeciesGraffiti,          // {Red_graffiti, Blue_graffiti}
    pub push_strength: SpeciesPushStrength, // {Red_graffiti, Blue_graffiti}
    pub blue_agents: u32,
    pub red_agents: u32,
    pub agents_out: [NeighbourAgentsOut; 2], // amount of outgoing agents per species
    dimensions: Dims,
}

impl Node {
    pub fn new(index: u32, edges: &Vec<NeighbourIndeces>, dimensions: &Dims) -> Self {
        let agents_out = [
            NeighbourAgentsOut::new(dimensions.clone()),
            NeighbourAgentsOut::new(dimensions.clone()),
        ];

        Node {
            index,
            neighbours: edges.get(index as usize).unwrap().to_owned(),
            graffiti: SpeciesGraffiti::new(0.0, 0.0),
            push_strength: SpeciesPushStrength::new(0.0, 0.0),
            blue_agents: 0,
            red_agents: 0,
            agents_out,
            dimensions: dimensions.clone(),
        }
    }
    fn get_prng(&self) -> Rand32 {
        Rand32::new((self.index + 1) as u64 * (self.blue_agents + self.red_agents + 1) as u64)
    }

    fn get_push_strength(&self, species: &AgentSpecies) -> f32 {
        match species {
            AgentSpecies::Red => self.push_strength.red,
            AgentSpecies::Blue => self.push_strength.blue,
        }
    }

    pub fn add_agents(&mut self, amount: u32, species: AgentSpecies) {
        match species {
            AgentSpecies::Red => self.red_agents += amount,
            AgentSpecies::Blue => self.blue_agents += amount,
        }
    }

    pub fn get_agents_with_species(&self, species: &AgentSpecies) -> u32 {
        match species {
            AgentSpecies::Blue => self.red_agents,
            AgentSpecies::Red => self.blue_agents,
        }
    }

    pub fn update_graffiti_and_push_strength(
        &mut self,
        hyper_params: &HyperParams,
        _grid_size: u32,
    ) {
        let l_squared: f32 = 1.0; //(1.0 / grid_size as f32).powf(2.0);
                                  // TODO: check if algorithm still works with grid_size

        // 0 - Decrement current graffiti by lambda
        self.graffiti.mult_all(1.0 - hyper_params.lambda);

        // 1 - Increase grafiti by gamma * sum of same agent' count
        self.graffiti
            .add_red(hyper_params.gamma * self.red_agents as f32 / l_squared);
        self.graffiti
            .add_blue(hyper_params.gamma * self.blue_agents as f32 / l_squared);

        // 2 - Calculate push strength
        self.push_strength
            .set_red(E.powf(-hyper_params.beta * self.graffiti.red / l_squared));
        self.push_strength
            .set_blue(E.powf(-hyper_params.beta * self.graffiti.blue / l_squared));
    }

    pub fn move_agents_out(&mut self, nodes: &Vec<Self>, _grid_size: u32) {
        let neighbours_idx = &self.neighbours;

        // 1 - Calculate neighbour strengths
        let mut total_neigh_push_strengths_red = 0.0;
        let mut total_neigh_push_strengths_blue = 0.0;

        let neighbour_push_stengths_iter = neighbours_idx.data.iter().map(|neighbour_idx| {
            let neighbour = &nodes[*neighbour_idx as usize];
            let red_push = neighbour.get_push_strength(&AgentSpecies::Red);
            let blue_push = neighbour.get_push_strength(&AgentSpecies::Blue);

            total_neigh_push_strengths_red += red_push;
            total_neigh_push_strengths_blue += blue_push;
            (red_push, blue_push)
        });

        // neighbour_push_stengths.0 is a Vec of all red neighbour push strengths
        // neighbour_push_stengths.1 is a Vec of all blue neighbour push strengths
        let neighbour_push_stengths: (Vec<f32>, Vec<f32>) = neighbour_push_stengths_iter.unzip(); // Vec<(ps1_red, ps2_blue), (ps_2_red, ps2_blue)> => (Vec(ps1_red, ps_2_red), Vec(ps1_blue, ps2_blue))
        assert!(neighbour_push_stengths.0.len() == neighbour_push_stengths.1.len());

        let mut red_agents_out = NeighbourAgentsOut::new(self.dimensions.clone());
        let mut blue_agents_out = NeighbourAgentsOut::new(self.dimensions.clone());
        let mut prng = self.get_prng();

        // 2 - Move agents out
        for _ in 0..self.red_agents {
            red_agents_out.add_agent_to_random_cell(
                &neighbour_push_stengths.1,      // vec of blue push strengths
                total_neigh_push_strengths_blue, // sum of all blue push strengths
                &mut prng,
            );
        }

        for _ in 0..self.blue_agents {
            blue_agents_out.add_agent_to_random_cell(
                &neighbour_push_stengths.0,     // vec of red push strengths
                total_neigh_push_strengths_red, // sum of all red push strengths
                &mut prng,
            );
        }

        self.agents_out = [red_agents_out, blue_agents_out];
    }

    pub fn move_agents_in(&mut self, nodes: &Vec<Self>) {
        let neighbours_idx = &self.neighbours.clone();
        self.red_agents = 0;
        self.blue_agents = 0;

        for (id, side_idx) in neighbours_idx.data.iter().enumerate() {
            let node_agents = &nodes[*side_idx as usize].agents_out;
            self.red_agents += node_agents[0].opposite_field(id);
            self.blue_agents += node_agents[1].opposite_field(id);
        }
    }
}

// AGENT SUB NODE
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentNode {
    pub blue: u32,
    pub red: u32,
}

impl SubNode for AgentNode {}

impl From<Node> for AgentNode {
    fn from(agent: Node) -> Self {
        AgentNode {
            blue: agent.blue_agents,
            red: agent.red_agents,
        }
    }
}

// GRAFFITI SUB NODE
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraffitiNode {
    pub blue: f32,
    pub red: f32,
}

impl SubNode for GraffitiNode {}

impl From<Node> for GraffitiNode {
    fn from(agent: Node) -> Self {
        GraffitiNode {
            blue: agent.graffiti.blue,
            red: agent.graffiti.red,
        }
    }
}
