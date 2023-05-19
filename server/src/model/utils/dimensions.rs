use std::fmt::{Display, Formatter};

use serde::{Deserialize, Serialize};

/// # Dims
///
/// ```
/// use server::model::dimensions::Dims;
/// assert!(Dims::One as u32 == 1);
/// assert!(Dims::Two as u32 == 2);
/// assert!(Dims::Three as u32 == 3);
/// ```
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum Dims {
    One = 1,
    Two = 2,
    Three = 3,
}

impl Display for Dims {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Dims::One => write!(f, "1d"),
            Dims::Two => write!(f, "2d"),
            Dims::Three => write!(f, "3d"),
        }
    }
}

impl From<&str> for Dims {
    fn from(dimensions: &str) -> Self {
        match dimensions {
            "1d" => Dims::One,
            "2d" => Dims::Two,
            "3d" => Dims::Three,
            _ => panic!("Invalid dimensions: {}", dimensions),
        }
    }
}
