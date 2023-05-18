use crate::{
    neighbour_data::{Dims, NeighbourIndeces},
    nodes::Node,
    utils::{AgentSpecies, HyperParams},
};
use oorandom::Rand32;
use rayon::prelude::*;
use serde::Serialize;
use std::fmt::{Debug, Display};

pub trait UniverseTrait: Debug + Display {
    fn new(size: u32, agent_size: u32, seed: u64) -> Self;
    fn set_hyper_params(&mut self, hyper_params: HyperParams);
    fn tick(&mut self);
    fn iterate(&mut self, iterations: u32);
}

#[derive(Serialize, Clone)]
struct Universe {
    size: u32,
    nodes: Vec<Node>,
    hyper_params: HyperParams,
    pub iteration: u32,
    total_size: u32,
}

fn edges_for_1d(size: u32) -> Vec<NeighbourIndeces> {
    let mut edges: Vec<NeighbourIndeces> = Vec::new();

    for i in 0..size {
        let left_index = (i + size - 1) % size;
        let right_index = (i + 1) % size;

        let new_edges = NeighbourIndeces::new(vec![right_index], vec![left_index], Dims::One);
    }

    edges
}

fn edges_for_2d(size: u32) -> Vec<NeighbourIndeces> {
    let mut edges: Vec<NeighbourIndeces> = Vec::new();

    for y in 0..size {
        for x in 0..size {
            let index = y * size + x;

            let left_index = y * size + (x + size - 1) % size;
            let right_index = y * size + (x + 1) % size;
            let top_index = (y + size - 1) % size * size + x;
            let bottom_index = (y + 1) % size * size + x;

            let new_edges = NeighbourIndeces::new(
                vec![top_index, right_index],
                vec![bottom_index, left_index],
                Dims::Two,
            );

            edges.push(new_edges);
        }
    }

    edges
}

fn edges_for_3d(size: u32) -> Vec<NeighbourIndeces> {
    let mut edges: Vec<NeighbourIndeces> = Vec::new();

    for z in 0..size {
        for y in 0..size {
            for x in 0..size {
                let index = z * size * size + y * size + x;

                let left_index = z * size * size + y * size + (x + size - 1) % size;
                let right_index = z * size * size + y * size + (x + 1) % size;
                let top_index = z * size * size + (y + size - 1) % size * size + x;
                let bottom_index = z * size * size + (y + 1) % size * size + x;
                let front_index = (z + size - 1) % size * size * size + y * size + x;
                let back_index = (z + 1) % size * size * size + y * size + x;

                let new_edges = NeighbourIndeces::new(
                    vec![top_index, right_index, front_index],
                    vec![bottom_index, left_index, back_index],
                    Dims::Three,
                );

                edges.push(new_edges);
            }
        }
    }

    edges
}

impl Universe {
    pub fn new(size: u32, agent_size: u32, dimensions: Dims, seed: Option<u64>) -> Self {
        let mut prng = Rand32::new(seed.unwrap_or(100));
        let total_size = size.pow(dimensions.clone() as u32); // if size=10 and dimensions=3, total_size=1000 (10*10*10)

        let edges = match &dimensions {
            Dims::One => edges_for_1d(size),
            Dims::Two => edges_for_2d(size),
            Dims::Three => edges_for_3d(size),
        };

        let mut nodes: Vec<Node> = (0..total_size)
            .map(|index| Node::new(index, &edges, &dimensions))
            .collect();

        // Set initial agents
        (0..agent_size * 2).for_each(|id| {
            let node_index = prng.rand_range(0..(size * size));
            let species = if id % 2 == 0 {
                AgentSpecies::Red
            } else {
                AgentSpecies::Blue
            };

            nodes[node_index as usize].add_agents(1, species);
        });

        Universe {
            size,
            nodes,
            iteration: 0,
            hyper_params: HyperParams::default(),
            total_size,
        }
    }

    pub fn set_hyper_params(&mut self, hyper_params: HyperParams) {
        self.hyper_params = hyper_params;
    }

    pub fn tick(&mut self) {
        // 0) update graffiti in nodes
        self.nodes.par_iter_mut().for_each(|node| {
            node.update_graffiti_and_push_strength(&self.hyper_params, self.size);
        });
        let nodes_with_graffiti = self.nodes.clone();

        // 1) move agents out
        self.nodes.par_iter_mut().for_each(|node| {
            node.move_agents_out(&nodes_with_graffiti, self.size);
        });

        // 2) move agents in
        let nodes_with_agents_out = self.nodes.clone();
        self.nodes.par_iter_mut().for_each(|node| {
            node.move_agents_in(&nodes_with_agents_out);
        });

        self.iteration += 1;
    }
}

#[cfg(test)]
mod test_2d_universe {

    use super::*;

    fn total_agent_size(universe: &Universe) -> u32 {
        universe
            .nodes
            .iter()
            .map(|node| node.blue_agents + node.red_agents)
            .sum()
    }

    #[test]
    fn test_universe2d() {
        let universe = Universe::new(4, 100, Dims::Two, None);

        for node in &universe.nodes {
            // assert that each node has 4 neighbours
            assert_eq!(node.neighbours.data.len(), 4);
        }

        fn total_agent_size_of_species(universe: &Universe, species: AgentSpecies) -> u32 {
            universe
                .nodes
                .iter()
                .map(|node| node.get_agents_with_species(&species))
                .sum()
        }

        assert_eq!(total_agent_size(&universe), 200);
        assert_eq!(
            total_agent_size_of_species(&universe, AgentSpecies::Blue),
            100
        );
        assert_eq!(
            total_agent_size_of_species(&universe, AgentSpecies::Red),
            100
        );
    }

    #[test]
    fn test_tick_agent_equal() {
        let mut universe = Universe::new(4, 100, Dims::Two, None);

        assert_eq!(total_agent_size(&universe), 200, "0 iteration agents");
        universe.tick();
        assert_eq!(total_agent_size(&universe), 200, "1 iteration agents");
        universe.tick();
        assert_eq!(total_agent_size(&universe), 200, "2 iteration agents");

        let cache = vec![
            (5, 5),
            (8, 2),
            (4, 11),
            (13, 7),
            (8, 6),
            (6, 5),
            (5, 8),
            (5, 7),
            (5, 5),
            (4, 6),
            (10, 4),
            (3, 2),
            (9, 8),
            (6, 10),
            (5, 7),
            (4, 7),
        ];

        let mut universe_hash_i = 0;

        universe
            .nodes
            .iter()
            .zip(cache)
            .for_each(|(node, cache_node_agents)| {
                universe_hash_i += node.blue_agents + (node.red_agents * (node.index + 1));
                print!(
                    "({}, {}, {}), ",
                    node.index, node.red_agents, node.blue_agents
                );
                assert_eq!(
                    node.red_agents, cache_node_agents.0,
                    "red agents on index {}",
                    node.index
                );
                assert_eq!(
                    node.blue_agents, cache_node_agents.1,
                    "blue agents on index {}",
                    node.index
                );
            });
        println!("universe_hash_i: {}", universe_hash_i);
    }
}
