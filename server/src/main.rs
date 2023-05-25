mod endpoints;
mod model;

use actix_cors::Cors;
use actix_web::{
    get, middleware,
    web::{self, Data},
    App, HttpResponse, HttpServer, Responder, Result,
};
use endpoints::endpoints_model;
use model::Universe;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

pub struct AppGlobalState {
    universe1d: Mutex<Option<Universe>>, // <- Mutex is necessary to mutate safely across threads
    universe2d: Mutex<Option<Universe>>,
    universe3d: Mutex<Option<Universe>>,
}

#[derive(Serialize, Deserialize)]
pub struct AliveResponse {
    universe1d: bool,
    universe2d: bool,
    universe3d: bool,
}

#[get("/alive")]
async fn is_alive(data: Data<AppGlobalState>) -> Result<impl Responder> {
    let universe1d = data.universe1d.lock().unwrap();
    let universe2d = data.universe2d.lock().unwrap();
    let universe3d = data.universe3d.lock().unwrap();

    let resp = AliveResponse {
        universe1d: universe1d.is_some(),
        universe2d: universe2d.is_some(),
        universe3d: universe3d.is_some(),
    };

    Ok(HttpResponse::Ok().json(resp))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Note: web::Data created _outside_ HttpServer::new closure
    let universe_state = web::Data::new(AppGlobalState {
        universe1d: Mutex::new(None),
        universe2d: Mutex::new(None),
        universe3d: Mutex::new(None),
    });

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_header()
            .allow_any_method();

        App::new()
            .wrap(middleware::Compress::default())
            .wrap(cors)
            .app_data(universe_state.clone())
            .service(
                web::scope("/v1")
                    .service(is_alive)
                    .service(endpoints_model()),
            )
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
