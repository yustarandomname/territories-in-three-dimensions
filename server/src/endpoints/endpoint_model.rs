use std::sync::MutexGuard;

use actix_web::{error, get, patch, post, web, HttpResponse, Responder, Result};

use crate::{
    endpoints::{HyperParamsQuery, IterateQuery, SetupSeedQuery},
    model::{dimensions::Dims, hyper_params::HyperParams, Universe},
    AppGlobalState,
};

fn get_universe(data: web::Data<AppGlobalState>, dimensions: Dims) -> Result<Universe> {
    let universe: MutexGuard<Option<Universe>>;
    match dimensions {
        Dims::One => {
            universe = data.universe1d.lock().unwrap();
        }
        Dims::Two => {
            universe = data.universe2d.lock().unwrap();
        }
        Dims::Three => {
            universe = data.universe3d.lock().unwrap();
        }
    }

    let universe = universe.clone().ok_or(error::ErrorBadRequest(format!(
        "There is no universe for {}. Create one first by calling `POST /v1/{}/setup/<size>/<agents>`.",
        dimensions,
        dimensions
    )))?;

    Ok(universe)
}

fn mutate_universe(
    data: web::Data<AppGlobalState>,
    dimensions: &Dims,
    f: impl FnOnce(&mut Universe) -> Result<HttpResponse>,
) -> Result<impl Responder> {
    let universe: MutexGuard<Option<Universe>>;
    match dimensions {
        Dims::One => {
            universe = data.universe1d.lock().unwrap();
        }
        Dims::Two => {
            universe = data.universe2d.lock().unwrap();
        }
        Dims::Three => {
            universe = data.universe3d.lock().unwrap();
        }
    }

    let mut universe = universe.clone().ok_or(error::ErrorBadRequest(format!(
        "There is no universe for {}. Create one first by calling `POST /v1/{}/setup/<size>/<agents>`.",
        dimensions,
        dimensions
    )))?;

    f(&mut universe)
}

#[get("/")]
pub async fn get_state(
    data: web::Data<AppGlobalState>,
    path: web::Path<String>,
) -> Result<impl Responder> {
    let dimensions = Dims::from(path.as_str());

    let universe = get_universe(data, dimensions)?;

    return Ok(web::Json(universe));
}

#[post("/setup/{size}/{agents}")]
pub async fn setup(
    data: web::Data<AppGlobalState>,
    path: web::Path<(String, u32, u32)>,
    query: web::Query<SetupSeedQuery>,
) -> Result<impl Responder> {
    let (dim_string, size, agents) = path.into_inner();
    let dimensions = Dims::from(dim_string.as_str());

    let mut universe: MutexGuard<Option<Universe>>;
    match dimensions {
        Dims::One => {
            universe = data.universe1d.lock().unwrap();
        }
        Dims::Two => {
            universe = data.universe2d.lock().unwrap();
        }
        Dims::Three => {
            universe = data.universe3d.lock().unwrap();
        }
    }
    // Set up the universe
    let new_universe = Universe::new(size, agents, Dims::Two, query.seed);
    universe.replace(new_universe.clone());

    Ok(web::Json(new_universe))
}

#[post("/set_params")]
pub async fn set_params(
    data: web::Data<AppGlobalState>,
    path: web::Path<String>,
    query: web::Query<HyperParamsQuery>,
) -> Result<impl Responder> {
    let dimensions = Dims::from(path.as_str());
    let params = HyperParams::new(
        query.gamma.unwrap_or(HyperParams::default().gamma),
        query.lambda.unwrap_or(HyperParams::default().lambda),
        query.beta.unwrap_or(HyperParams::default().beta),
    );

    mutate_universe(data, &dimensions, move |universe| {
        universe.set_hyper_params(params);
        Ok(HttpResponse::Ok().body(format!("Hyper parameters set to {:?}", params)))
    })
}

#[patch("/iterate")]
pub async fn iterate(
    data: web::Data<AppGlobalState>,
    path: web::Path<String>,
    query: web::Query<IterateQuery>,
) -> Result<impl Responder> {
    let dimensions = Dims::from(path.as_str());
    let iterations = query.amount.unwrap_or(1);

    mutate_universe(data, &dimensions, move |universe| {
        universe.iterate(iterations);
        Ok(HttpResponse::Ok().body(format!(
            "Universe is incremented by {} iterations. Current iteration is {}",
            iterations, universe.iteration
        )))
    })
}
