mod endpoints;
mod model;

use actix_web::{web, App, HttpServer};
use endpoints::endpoints_model;
use model::Universe;
use std::sync::Mutex;

pub struct AppGlobalState {
    universe1d: Mutex<Option<Universe>>, // <- Mutex is necessary to mutate safely across threads
    universe2d: Mutex<Option<Universe>>,
    universe3d: Mutex<Option<Universe>>,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Note: web::Data created _outside_ HttpServer::new closure
    let counter = web::Data::new(AppGlobalState {
        universe1d: Mutex::new(None),
        universe2d: Mutex::new(None),
        universe3d: Mutex::new(None),
    });

    HttpServer::new(move || {
        App::new()
            .app_data(counter.clone())
            .service(web::scope("/v1").service(endpoints_model()))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
