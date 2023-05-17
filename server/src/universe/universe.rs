use std::fmt::{Debug, Display};

use crate::utils::HyperParams;

pub trait Universe: Debug + Display {
    fn new(size: u32, agent_size: u32, seed: u64) -> Self;
    fn set_hyper_params(&mut self, hyper_params: HyperParams);
    fn tick(&mut self);
    fn iterate(&mut self, iterations: u32);
}
