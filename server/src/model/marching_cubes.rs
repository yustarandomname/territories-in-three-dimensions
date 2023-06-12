use isosurface::{marching_cubes::MarchingCubes, source::Source};

use super::{node::Node, species::AgentSpecies, Universe};

impl Universe {
    fn generate_mc(&self) {
        let mut vertices = Vec::new();
        let mut indices = Vec::new();
        let source = &self;

        let mut mc = MarchingCubes::new(self.size as usize);

        mc.extract(self, &mut vertices, &mut indices);

        println!("Vertices: {:?}", vertices);
        // println!("indices: {:?}", indices);

        assert!(indices.len() % 3 == 0);
    }

    fn get_node(&self, x: u32, y: u32, z: u32) -> Option<&Node> {
        let index = x + y * self.size + z * self.size * self.size;

        let res = self.nodes.get(index as usize);

        match res {
            Some(node) => Some(node),
            None => {
                print!("Index out of bounds: {} {} {}", x, y, z);
                None
            }
        }
    }
}

impl Source for Universe {
    fn sample(&self, x: f32, y: f32, z: f32) -> f32 {
        let xu = (x.clone() * (self.size - 1) as f32) as u32 % self.size;
        let yu = (y.clone() * (self.size - 1) as f32) as u32 % self.size;
        let zu = (z.clone() * (self.size - 1) as f32) as u32 % self.size;

        // println!("SampleXU: {} {} {}", xu, yu, zu);
        match self.get_node(xu, yu, zu) {
            Some(node) => {
                let red_agents = node.get_agents_with_species(&AgentSpecies::Red);
                let blue_agents = node.get_agents_with_species(&AgentSpecies::Blue);

                // println!("Node IS found: {} {} {} | {} {} {}", xu, yu, zu, x, y, z);

                red_agents as f32 - blue_agents as f32
            }
            None => {
                println!("Node not found: {} {} {} | {} {} {}", xu, yu, zu, x, y, z);
                0.0
            }
        }
    }
}

#[cfg(test)]
mod test_mc {
    use crate::model::dimensions::Dims;

    use super::*;

    #[test]
    fn test_mc() {
        let mut universe = Universe::new(10, 10000, Dims::Three, None);
        universe.iterate(1000);

        universe.generate_mc();
    }
}
