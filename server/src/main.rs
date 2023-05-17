use actix_web::{error, get, patch, post, web, App, HttpServer, Result};
use serde::Deserialize;
use std::sync::Mutex;

#[derive(Debug, Deserialize)]
struct HyperParams {
    gamma: f32,
    lambda: f32,
    beta: f32,
}

const DEFAULT_PARAMS: HyperParams = HyperParams {
    gamma: 0.5,
    lambda: 0.5,
    beta: 0.1,
};

#[derive(Debug, Deserialize)]
struct Universe {
    size: u32,
    agents: [u32; 2],
    seed: u32,
    iteration: u32,
    hyper_params: HyperParams,
}

impl Universe {
    fn new(size: u32, agents: [u32; 2], seed: u32) -> Universe {
        Universe {
            size,
            agents,
            seed,
            iteration: 0,
            hyper_params: DEFAULT_PARAMS,
        }
    }

    fn increment(&mut self, iterations: u32) {
        self.iteration += iterations;
    }

    fn set_params(&mut self, gamma: f32, lambda: f32, beta: f32) {
        self.hyper_params = HyperParams {
            gamma: gamma,
            lambda: lambda,
            beta: beta,
        };
    }
}

struct AppStateWithCounter {
    universe2d: Mutex<Option<Universe>>, // <- Mutex is necessary to mutate safely across threads
}

#[get("/")]
async fn get_state_2d(data: web::Data<AppStateWithCounter>) -> Result<String> {
    let universe2d = data.universe2d.lock().unwrap(); // <- get counter's MutexGuard
    match universe2d.as_ref() {
        None => Err(error::ErrorBadRequest("Universe is not initialized")),
        Some(universe) => Ok(format!("Universe is defined with size {:?}", universe)),
    }
}

#[derive(Deserialize, Debug)]
struct SetupSeedQuery {
    seed: Option<u32>,
}

#[post("/setup/{size}/{agents}")]
async fn setup_2d(
    data: web::Data<AppStateWithCounter>,
    path: web::Path<(u32, u32)>,
    query: web::Query<SetupSeedQuery>,
) -> String {
    let (size, agents) = path.into_inner();

    let mut universe2d = data.universe2d.lock().unwrap();

    // Set up the universe
    let new_universe = Universe::new(size, [agents, agents], query.seed.unwrap_or(0));
    universe2d.replace(new_universe);

    format!("Universe is created {:?}", universe2d)
}

#[derive(Deserialize, Debug)]
struct HyperParamsQuery {
    gamma: Option<f32>,
    lambda: Option<f32>,
    beta: Option<f32>,
}

#[post("/set_params")]
async fn set_params_2d(
    data: web::Data<AppStateWithCounter>,
    query: web::Query<HyperParamsQuery>,
) -> String {
    let params = HyperParams {
        gamma: query.gamma.unwrap_or(DEFAULT_PARAMS.gamma),
        lambda: query.lambda.unwrap_or(DEFAULT_PARAMS.lambda),
        beta: query.beta.unwrap_or(DEFAULT_PARAMS.beta),
    };

    let mut universe2d = data.universe2d.lock().unwrap();
    match universe2d.as_mut() {
        None => format!("Universe is not initialized"),
        Some(universe) => {
            universe.set_params(params.gamma, params.lambda, params.beta);
            format!(
                "Universe is defined with params {:?}",
                universe.hyper_params
            )
        }
    }
}

#[derive(Deserialize, Debug)]
struct IterateQuery {
    amount: Option<u32>,
}

#[patch("/iterate")]
async fn iterate_2d(
    data: web::Data<AppStateWithCounter>,
    query: web::Query<IterateQuery>,
) -> String {
    let iterations = query.amount.unwrap_or(1);

    let mut universe2d = data.universe2d.lock().unwrap();
    match universe2d.as_mut() {
        None => format!("Universe is not initialized"),
        Some(universe) => {
            universe.increment(iterations);
            format!(
                "Universe is incremented by {} iterations. Current iteration is {}",
                iterations, universe.iteration
            )
        }
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Note: web::Data created _outside_ HttpServer::new closure
    let counter = web::Data::new(AppStateWithCounter {
        universe2d: Mutex::new(None),
    });

    HttpServer::new(move || {
        // TODO: add guard from when universe is not initialized
        App::new().app_data(counter.clone()).service(
            web::scope("/v1").service(
                web::scope("/2d")
                    .service(get_state_2d)
                    .service(setup_2d)
                    .service(set_params_2d)
                    .service(iterate_2d),
            ),
        )
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
