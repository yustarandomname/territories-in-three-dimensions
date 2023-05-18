use oorandom::Rand32;
use serde::Serialize;

/// # Dims
///
/// ```
/// assert!(Dims::One as u32 == 1);
/// assert!(Dims::Two as u32 == 2);
/// assert!(Dims::Three as u32 == 3);
/// ```
#[derive(Debug, Clone, Serialize)]
pub enum Dims {
    One = 1,
    Two = 2,
    Three = 3,
}

#[derive(Debug, Clone, Serialize)]
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

#[derive(Debug, Clone, Serialize)]
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
        todo!("add_agent_to_random_cell")
    }
}

#[cfg(test)]
mod test {
    // TODO: NeighbourIndeces data has all unique values
}
