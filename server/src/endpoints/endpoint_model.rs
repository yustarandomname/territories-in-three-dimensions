use std::sync::MutexGuard;

use actix_web::{error, get, patch, post, web, HttpResponse, Responder, Result};

use crate::{
    endpoints::{HyperParamsQuery, IterateQuery, SetupSeedQuery},
    model::{dimensions::Dims, hyper_params::HyperParams, AgentUniverse, Universe},
    AppGlobalState,
};

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

    mutate_universe(data, &dimensions, move |universe| {
        Ok(HttpResponse::Ok().json(universe.clone()))
    })
}

#[get("/agent-nodes")]
pub async fn get_state_agents(
    data: web::Data<AppGlobalState>,
    path: web::Path<String>,
) -> Result<impl Responder> {
    let dimensions = Dims::from(path.as_str());

    mutate_universe(data, &dimensions, move |universe| {
        Ok(HttpResponse::Ok().json(AgentUniverse::from(universe.clone())))
    })
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
    let new_universe = Universe::new(size, agents, dimensions, query.seed);
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

#[cfg(test)]
mod tests {
    use std::sync::Mutex;

    use super::*;
    use actix_web::{http::StatusCode, test, web, App, Scope};

    fn setup_app() -> Scope {
        let universe_state = web::Data::new(AppGlobalState {
            universe1d: Mutex::new(None),
            universe2d: Mutex::new(None),
            universe3d: Mutex::new(None),
        });

        web::scope("/{dimensions:[1-3]d}")
            .app_data(universe_state)
            .service(get_state)
            .service(setup)
            .service(set_params)
            .service(iterate)
    }

    #[actix_web::test]
    async fn test_index_get_fail() {
        let app = test::init_service(App::new().service(setup_app())).await;
        let req = test::TestRequest::get().uri("/2d/").to_request();
        let resp = test::call_service(&app, req).await;

        // If the universe is not set up, we should get a 400
        assert_eq!(resp.status(), StatusCode::BAD_REQUEST);
    }

    #[actix_web::test]
    async fn test_setup_2d() {
        let app = test::init_service(App::new().service(setup_app())).await;
        let req = test::TestRequest::post()
            .uri("/2d/setup/4/100")
            .to_request();
        let resp: Universe = test::call_and_read_body_json(&app, req).await;

        // Send a POST request to set up the universe
        assert_eq!(resp.iteration, 0);
        assert_eq!(resp.total_size, 16);
        assert_eq!(resp.nodes.len(), 16);

        // Send a GET request to get the universe
        let req2d = test::TestRequest::get().uri("/2d/").to_request();
        let resp = test::call_service(&app, req2d).await;
        assert_eq!(resp.status(), StatusCode::OK);
        assert_eq!(
            resp.headers()
                .get("Content-Type")
                .unwrap()
                .to_str()
                .unwrap(),
            "application/json"
        );

        // 1d and 3d are not setup
        let req1d = test::TestRequest::get().uri("/1d/").to_request();
        let resp = test::call_service(&app, req1d).await;
        assert_eq!(resp.status(), StatusCode::BAD_REQUEST);

        let req3d = test::TestRequest::get().uri("/3d/").to_request();
        let resp = test::call_service(&app, req3d).await;
        assert_eq!(resp.status(), StatusCode::BAD_REQUEST);
    }

    #[actix_web::test]
    async fn test_setup_3d() {
        let app = test::init_service(App::new().service(setup_app())).await;
        let req = test::TestRequest::post()
            .uri("/3d/setup/4/100")
            .to_request();
        let resp: Universe = test::call_and_read_body_json(&app, req).await;

        // Send a POST request to set up the universe
        assert_eq!(resp.iteration, 0);
        assert_eq!(resp.total_size, 64);
        assert_eq!(resp.nodes.len(), 64);
    }

    #[actix_web::test]
    async fn test_setup_1d() {
        let app = test::init_service(App::new().service(setup_app())).await;
        let req = test::TestRequest::post()
            .uri("/1d/setup/4/100")
            .to_request();
        let resp: Universe = test::call_and_read_body_json(&app, req).await;

        // Send a POST request to set up the universe
        assert_eq!(resp.iteration, 0);
        assert_eq!(resp.total_size, 4);
        assert_eq!(resp.nodes.len(), 4);
    }
}
