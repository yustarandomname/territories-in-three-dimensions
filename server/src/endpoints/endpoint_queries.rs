use serde::Deserialize;

#[derive(Deserialize, Debug)]
// TODO: add description
pub struct SetupSeedQuery {
    pub seed: Option<u64>,
}

#[derive(Deserialize, Debug)]
// TODO: add description
pub struct IterateQuery {
    pub amount: Option<u32>,
}

#[derive(Deserialize, Debug)]
// TODO: add description
pub struct HyperParamsQuery {
    pub gamma: Option<f32>,
    pub lambda: Option<f32>,
    pub beta: Option<f32>,
}
