mod endpoints;
mod neighbour_data;
mod nodes;
mod universe;
mod utils;

use actix_web::{web, App, HttpServer};
use endpoints::{endpoints_2d, endpoints_3d};
use std::sync::Mutex;
use universe::{Universe2D, Universe3D};

pub struct AppGlobalState {
    universe2d: Mutex<Option<Universe2D>>, // <- Mutex is necessary to mutate safely across threads
    universe3d: Mutex<Option<Universe3D>>,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Note: web::Data created _outside_ HttpServer::new closure
    let counter = web::Data::new(AppGlobalState {
        universe2d: Mutex::new(None),
        universe3d: Mutex::new(None),
    });

    HttpServer::new(move || {
        App::new().app_data(counter.clone()).service(
            web::scope("/v1")
                .service(endpoints_2d())
                .service(endpoints_3d()),
        )
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
