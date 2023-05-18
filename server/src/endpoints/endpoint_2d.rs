use crate::{
    endpoints::{HyperParamsQuery, IterateQuery, SetupSeedQuery},
    universe::{Universe2D, UniverseTrait},
    utils::HyperParams,
    AppGlobalState,
};
use actix_web::{error, get, patch, post, web, Responder, Result};

#[get("/")]
async fn get_state_2d(data: web::Data<AppGlobalState>) -> Result<impl Responder> {
    let universe2d = data.universe2d.lock().unwrap();

    let universe = universe2d
        .clone()
        .ok_or(error::ErrorBadRequest("Universe is not initialized"))?;

    let json = web::Json(universe);

    return Ok(json);
}

#[post("/setup/{size}/{agents}")]
pub async fn setup_2d(
    data: web::Data<AppGlobalState>,
    path: web::Path<(u32, u32)>,
    query: web::Query<SetupSeedQuery>,
) -> String {
    let (size, agents) = path.into_inner();

    let mut universe2d = data.universe2d.lock().unwrap();

    // Set up the universe
    let new_universe = Universe2D::new(size, agents, query.seed.unwrap_or(100));
    universe2d.replace(new_universe);

    format!("Universe is created {:?}", universe2d)
}

#[post("/set_params")]
pub async fn set_params_2d(
    data: web::Data<AppGlobalState>,
    query: web::Query<HyperParamsQuery>,
) -> String {
    let params = HyperParams::new(
        query.gamma.unwrap_or(HyperParams::default().gamma),
        query.lambda.unwrap_or(HyperParams::default().lambda),
        query.beta.unwrap_or(HyperParams::default().beta),
    );

    let mut universe2d = data.universe2d.lock().unwrap();
    match universe2d.as_mut() {
        None => format!("Universe is not initialized"),
        Some(universe) => {
            universe.set_hyper_params(params);
            format!("Universe is now defined with params {:?}", params)
        }
    }
}

#[patch("/iterate")]
pub async fn iterate_2d(
    data: web::Data<AppGlobalState>,
    query: web::Query<IterateQuery>,
) -> String {
    let iterations = query.amount.unwrap_or(1);

    let mut universe2d = data.universe2d.lock().unwrap();
    match universe2d.as_mut() {
        None => format!("Universe is not initialized"),
        Some(universe) => {
            universe.iterate(iterations);
            format!(
                "Universe is incremented by {} iterations. Current iteration is {}",
                iterations, universe.iteration
            )
        }
    }
}
