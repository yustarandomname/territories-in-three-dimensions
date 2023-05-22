use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Copy)]

/**
 * gamma: The amount of grafitti that is removed from a node
 * lambda: The amount of grafitti that is added to a node
 * beta: The amount of bias a agent will be
 */
#[derive(Serialize, Deserialize)]
pub struct HyperParams {
    pub gamma: f32,
    pub lambda: f32,
    pub beta: f32,
}

impl HyperParams {
    /// Creates a new HyperParams struct
    /// ```
    /// use server::model::hyper_params::HyperParams;
    /// let params = HyperParams::new(0.5, 0.75, 0.1);
    /// assert_eq!(params.gamma, 0.5);
    /// assert_eq!(params.lambda, 0.75);
    /// assert_eq!(params.beta, 0.1);
    /// ```
    pub fn new(gamma: f32, lambda: f32, beta: f32) -> HyperParams {
        HyperParams {
            gamma,
            lambda,
            beta,
        }
    }
}

impl Default for HyperParams {
    /// Creates a new HyperParams struct with default values
    /// These are sensible parameters and used in the paper: https://doi.org/10.1016/j.physa.2018.07.004
    fn default() -> HyperParams {
        HyperParams {
            gamma: 0.5,
            lambda: 0.5,
            beta: 0.01,
        }
    }
}
