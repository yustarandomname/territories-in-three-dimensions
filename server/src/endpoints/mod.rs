mod endpoint_2d;
mod endpoint_3d;
mod endpoint_queries;

use actix_web::web;

pub use endpoint_queries::*;

use endpoint_2d::*;
use endpoint_3d::*;

pub fn endpoints_2d() -> actix_web::Scope {
    web::scope("/2d")
        .service(get_state_2d)
        .service(setup_2d)
        .service(set_params_2d)
        .service(iterate_2d)
}

pub fn endpoints_3d() -> actix_web::Scope {
    web::scope("/3d")
        .service(get_state_3d)
        .service(setup_3d)
        .service(set_params_3d)
        .service(iterate_3d)
}
