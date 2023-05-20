use crate::mc::polygonise;

mod mc;

fn main() {
    let values: [f32; 8] = [0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0];

    let isolevel = 0.5;
    let triangles = polygonise(&values, isolevel);

    let serde_triangles: Vec<mc::SerdeTriangle> =
        triangles.iter().map(|t| t.to_serde()).collect::<Vec<_>>();

    println!("triangle_count: {}", triangles.len());
    println!(
        "triangles: {:?}",
        serde_json::to_string(&serde_triangles).unwrap()
    );
}
