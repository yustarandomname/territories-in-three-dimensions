mod endpoint_model;
mod endpoint_queries;

use actix_web::web;

use endpoint_model::*;
pub use endpoint_queries::*;

pub fn endpoints_model() -> actix_web::Scope {
    web::scope("/{dimensions:[1-3]d}")
        .service(get_state)
        .service(get_state_agents)
        .service(setup)
        .service(set_params)
        .service(iterate)
}
