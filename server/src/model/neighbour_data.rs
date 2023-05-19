use oorandom::Rand32;
use serde::{Deserialize, Serialize};

use super::utils::dimensions::Dims;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NeighbourIndeces {
    pub data: Vec<u32>, // neighbour_id and opposite_id
    dimensions: Dims,
}

impl NeighbourIndeces {
    pub fn new(positive_indeces: Vec<u32>, negative_indecies: Vec<u32>, dimensions: Dims) -> Self {
        assert!(positive_indeces.len() == negative_indecies.len());
        assert!(positive_indeces.clone().len() == dimensions.clone() as usize);

        let data: Vec<u32> = positive_indeces
            .into_iter()
            .chain(negative_indecies)
            .collect();

        NeighbourIndeces { data, dimensions }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NeighbourAgentsOut {
    pub data: Vec<u32>,
    dimensions: Dims,
}

impl NeighbourAgentsOut {
    pub fn new(dimensions: Dims) -> Self {
        let size = dimensions.clone() as u32 * 2;
        let data = vec![0; size as usize];

        NeighbourAgentsOut { data, dimensions }
    }

    pub fn add_agent_to_random_cell(
        &mut self,
        neighbour_push_stengths: &Vec<f32>,
        total_neighbour_push_stengths: f32,
        prng: &mut Rand32,
    ) {
        assert!(neighbour_push_stengths.len() == self.data.len());

        let random_number = prng.rand_float() * total_neighbour_push_stengths;
        let mut sum = 0.0;
        for (i, neighbour_push_stength) in neighbour_push_stengths.iter().enumerate() {
            sum += neighbour_push_stength;
            if sum >= random_number {
                self.data[i] += 1;
                break;
            }
        }
    }

    pub fn opposite_field(&self, id: usize) -> u32 {
        let dimension_size = self.dimensions.clone() as usize;
        let opposite_id = (id + dimension_size) % self.data.len();
        self.data[opposite_id]
    }
}

#[cfg(test)]
mod test {
    // TODO: NeighbourIndeces data has all unique values
}
