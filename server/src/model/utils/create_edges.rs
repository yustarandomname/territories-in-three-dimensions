use crate::model::neighbour_data::NeighbourIndeces;

use super::dimensions::Dims;

/// Creates the edges for a 1d universe
/// # Arguments
/// * `size` - The size of the universe
///
/// # Example
/// ```
/// use server::model::create_edges::create_edges_for;
/// use server::model::dimensions::Dims;
///
/// let edges = create_edges_for(&Dims::One, 4);
/// assert_eq!(edges.len(), 4); // total size = 4^1 = 4
///
/// let zero_edges = edges.get(0).unwrap();
/// assert_eq!(zero_edges.data.len(), 2); // 4 neighbours (right, left)
/// assert_eq!(zero_edges.data[0], 1); // right neighbour
/// assert_eq!(zero_edges.data[1], 3); // left neighbour
///
/// ```
fn edges_for_1d(size: u32) -> Vec<NeighbourIndeces> {
    let mut edges: Vec<NeighbourIndeces> = Vec::new();

    for i in 0..size {
        let left_index = (i + size - 1) % size;
        let right_index = (i + 1) % size;

        let new_edges = NeighbourIndeces::new(vec![right_index], vec![left_index], Dims::One);
        edges.push(new_edges);
    }

    edges
}

/// Creates the edges for a 2d universe
/// # Arguments
/// * `size` - The size of the universe
///
/// # Example
/// ```
/// use server::model::create_edges::create_edges_for;
/// use server::model::dimensions::Dims;
///
/// let edges = create_edges_for(&Dims::Two, 4);
/// assert_eq!(edges.len(), 16); // total size = 4^2 = 16
///
/// let zero_edges = edges.get(0).unwrap();
/// assert_eq!(zero_edges.data.len(), 4); // 4 neighbours (top, right, bottom, left)
/// assert_eq!(zero_edges.data[0], 12); // top neighbour
/// assert_eq!(zero_edges.data[1], 1); // right neighbour
/// assert_eq!(zero_edges.data[2], 4); // bottom neighbour
/// assert_eq!(zero_edges.data[3], 3); // left neighbour
///
/// ```
fn edges_for_2d(size: u32) -> Vec<NeighbourIndeces> {
    let mut edges: Vec<NeighbourIndeces> = Vec::new();

    for y in 0..size {
        for x in 0..size {
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

/// Creates the edges for a 3d universe
/// # Arguments
/// * `size` - The size of the universe
///
/// # Example
/// ```
/// use server::model::create_edges::create_edges_for;
/// use server::model::dimensions::Dims;
///
/// let edges = create_edges_for(&Dims::Three, 4);
/// assert_eq!(edges.len(), 64); // total size = 4^3 = 64
///
/// let zero_edges = edges.get(0).unwrap();
/// assert_eq!(zero_edges.data.len(), 6); // 6 neighbours (top, right, front, bottom, left, back)
/// assert_eq!(zero_edges.data[0], 12); // top neighbour
/// assert_eq!(zero_edges.data[1], 1); // right neighbour
/// assert_eq!(zero_edges.data[2], 48); // front neighbour
/// assert_eq!(zero_edges.data[3], 4); // bottom neighbour
/// assert_eq!(zero_edges.data[4], 3); // left neighbour
/// assert_eq!(zero_edges.data[5], 16); // back neighbour
fn edges_for_3d(size: u32) -> Vec<NeighbourIndeces> {
    let mut edges: Vec<NeighbourIndeces> = Vec::new();

    for z in 0..size {
        for y in 0..size {
            for x in 0..size {
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

pub fn create_edges_for(dimensions: &Dims, size: u32) -> Vec<NeighbourIndeces> {
    match dimensions {
        Dims::One => edges_for_1d(size),
        Dims::Two => edges_for_2d(size),
        Dims::Three => edges_for_3d(size),
    }
}
