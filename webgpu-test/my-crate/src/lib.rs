extern crate cfg_if;
extern crate wasm_bindgen;

mod utils;

use cfg_if::cfg_if;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

use isosurface::{marching_cubes::MarchingCubes, source::Source};

cfg_if! {
    if #[cfg(feature = "wee_alloc")] {
        extern crate wee_alloc;
        #[global_allocator]
        static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;
    }
}

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello,{}!", name));
}

#[wasm_bindgen]
pub struct Universe {
    size: u32,
    nodes: Vec<Node>,
}

#[wasm_bindgen]
impl Universe {
    pub fn new(size: u32) -> Universe {
        let nodes = Vec::new();

        return Universe { size, nodes };
    }

    pub fn add_node(&mut self, val: JsValue) -> Result<(), JsValue> {
        let node: Node = serde_wasm_bindgen::from_value(val)?;

        self.nodes.push(node);
        Ok(())
    }
}

impl Universe {
    fn generate_mc(&self) -> VerticesIndeces {
        let mut vertices = Vec::new();
        let mut indices = Vec::new();

        let mut mc = MarchingCubes::new(self.size as usize);

        mc.extract(self, &mut vertices, &mut indices);
        return VerticesIndeces { vertices, indices };
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
                let red_agents = node.red_agents;
                let blue_agents = node.blue_agents;

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

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct Node {
    red_agents: u32,
    blue_agents: u32,
}

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct VerticesIndeces {
    vertices: Vec<f32>,
    indices: Vec<u32>,
}

#[wasm_bindgen]
impl VerticesIndeces {
    pub fn get_vertices(&self) -> Result<JsValue, JsValue> {
        Ok(serde_wasm_bindgen::to_value(&self.vertices)?)
    }

    pub fn get_indeces(&self) -> Result<JsValue, JsValue> {
        Ok(serde_wasm_bindgen::to_value(&self.indices)?)
    }
}

#[wasm_bindgen]
pub fn mc(universe: &Universe) -> VerticesIndeces {
    universe.generate_mc()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mc() {
        let u = Universe {
            size: 4,
            nodes: Vec::new(),
        };

        assert!(mc(&u).vertices.len() == 0);
    }
}
