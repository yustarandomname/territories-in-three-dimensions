struct HyperParams {
    lambda: f32,
    gamma: f32,
    beta: f32,
    size: f32, // length of one side of grid
    iterations: f32,
    total_agents: f32,
    seed: f32,
}

struct Node {
    red_agents: f32,
    blue_agents: f32,
    red_graffiti: f32,
    blue_graffiti: f32,
    red_strength: f32,
    blue_strength: f32,
}

struct RandomResult {
    state: vec4<u32>,
    value: f32,
}

const workgroup_size = 100;

@group(0) @binding(0) var<uniform> hyperparameters: HyperParams; 
@group(0) @binding(1) var<storage> state_in: array<Node>; 
@group(0) @binding(2) var<storage, read_write> state_out: array<Node>;

@group(0) @binding(3) var<storage, read_write> red_agents_out: array<array<f32, 4>>;
@group(0) @binding(4) var<storage, read_write> blue_agents_out: array<array<f32, 4>>;

@group(0) @binding(5) var<storage, read_write> order_parameter_out: array<f32>;

fn taus_step(z: u32, S1: u32, S2: u32, S3: u32, M: u32) -> u32 {
    let b = (((z << S1) ^ z) >> S2);
    return (((z & M) << S3) ^ b);    
}

fn lcg_step(z: u32, A: u32, C: u32) -> u32 {
    return (A * z + C);    
}

// PRNG from https://developer.nvidia.com/gpugems/gpugems3/part-vi-gpu-computing/chapter-37-efficient-random-number-generation-and-application
fn random(state: vec4<u32>) -> RandomResult {
    let x = taus_step(state.x, 13, 19, 12, 4294967294);
    let y = taus_step(state.y, 2, 25, 4, 4294967288);
    let z = taus_step(state.z, 3, 11, 17, 4294967280);
    let w = lcg_step(state.w, 1664525, 1013904223);

    var result: RandomResult;
    result.state = vec4(x, y, z, w);
    result.value = 2.3283064365387e-10 * f32(x ^ y ^ z ^ w);

    return result;
}

fn get_neightbour_index(i: u32) -> array<u32, 4> {
    let size = u32(hyperparameters.size);
    
    let x = i % size;
    let y = (i / size);

    let left_index = (size + x - 1) % size + y * size;
    let right_index = (x + 1) % size + y * size;
    let top_index = x + ((size + y - 1) % size) * size;
    let bottom_index = x + ((y + 1) % size) * size;

    return array<u32, 4>(top_index, right_index, bottom_index, left_index);
}

/**
 * @param neighbour_indeces: array of 4 indeces of neighbours
 * @return vec2<f32>: total red strength, total blue strength
 */
fn total_strength(neighbour_indeces: array<u32, 4>) -> vec2<f32> {
    var total_red_strength = 0.0;
    var total_blue_strength = 0.0;

    for (var i = 0u; i < 4u; i = i + 1u) {
        total_red_strength += state_out[neighbour_indeces[i]].red_strength;
        total_blue_strength += state_out[neighbour_indeces[i]].blue_strength;
    }

    return vec2<f32>(total_red_strength, total_blue_strength);
}

@compute @workgroup_size(workgroup_size) fn update_graffiti_and_push_strength(
    @builtin(global_invocation_id) id: vec3<u32>
) {
    let i = id.x;
    if (i > u32(pow(hyperparameters.size, 2))) {return;} // Quick return if out of bounds

    let e = 2.71828;
    let xi_str = pow(hyperparameters.size, 2);

    let lambda = 1.0 - hyperparameters.lambda;
    let gamma = hyperparameters.gamma;
    let beta = hyperparameters.beta * xi_str;

    var red_graffiti = state_in[i].red_graffiti * lambda + state_in[i].red_agents * gamma;
    var blue_graffiti = state_in[i].blue_graffiti * lambda + state_in[i].blue_agents * gamma;

    // var prng = random(vec4<u32>(i + u32(hyperparameters.seed), u32(hyperparameters.seed) * 12, i * 43, i * 3478479));
    // for (var i = 0u; i < u32(state_in[i].red_agents); i++) {
    //     prng  = random(prng.state);
    //     let random_value = prng.value;

    //     if (random_value < gamma) {
    //         red_graffiti += 1.0;
    //     }
    // }

    // for (var i = 0u; i < u32(state_in[i].blue_agents); i++) {
    //     prng  = random(prng.state);
    //     let random_value = prng.value;

    //     if (random_value < gamma) {
    //         blue_graffiti += 1.0;
    //     }
    // }

    state_out[i].red_agents = 0;
    state_out[i].blue_agents = 0;
    state_out[i].red_graffiti = red_graffiti;
    state_out[i].blue_graffiti = blue_graffiti;
    state_out[i].red_strength = pow(e, -beta * red_graffiti);
    state_out[i].blue_strength = pow(e, -beta * blue_graffiti);
}

@compute @workgroup_size(workgroup_size) fn move_agents_out(
    @builtin(global_invocation_id) id: vec3<u32>
) {
    let i = id.x;
    if (i > u32(pow(hyperparameters.size, 2))) {return;}
    
    let neighbour_index = get_neightbour_index(i);

    let total_strength = total_strength(neighbour_index);
    let total_red_strength = total_strength.x;
    let total_blue_strength = total_strength.y;

    // 1) For each species (red and blue), for each agent, calculate the probability of moving to each neighbour
    // based on the strength of the opposites graffiti in that neighbour
    // 2)Then, randomly select a neighbour to move to based on the probabilities
    
    // Seed with neighbour indeces
    let iter = u32(hyperparameters.iterations + 1);
    let seed = vec4<u32>(neighbour_index[0] * iter, neighbour_index[1], neighbour_index[2], neighbour_index[3]);
    var prng = random(seed);
    prng = random(prng.state);

    red_agents_out[i][1] = state_in[i].red_agents; // Move all agents to right neighbour
    var cell_red_agents_out = array<f32, 4>(0, 0, 0, 0);
    var cell_blue_agents_out = array<f32, 4>(0, 0, 0, 0);

    var red_strength_acc = array<f32, 4>(state_out[neighbour_index[0]].red_strength, 0, 0, 0);
    var blue_strenths_acc = array<f32, 4>(state_out[neighbour_index[0]].blue_strength, 0, 0, 0);

    for (var bi: u32 = 1; bi < 4; bi++) {
        red_strength_acc[bi] = red_strength_acc[bi-1] + state_out[neighbour_index[bi]].red_strength;
        blue_strenths_acc[bi] = blue_strenths_acc[bi-1] + state_out[neighbour_index[bi]].blue_strength;
    }
    
    // Move each red agent
    for (var ri: u32 = 0; ri < u32(state_in[i].red_agents); ri++) {
        prng = random(prng.state);
        let random_result = prng.value * total_blue_strength;

        for (var bi: u32 = 0; bi < 4; bi++) {
            if (random_result <= blue_strenths_acc[bi]) {
                cell_red_agents_out[bi] += 1;
                break;
            }
        }
    }  

    // Move each blue agent
    for (var bi: u32 = 0; bi < u32(state_in[i].blue_agents); bi++) {
        prng = random(prng.state);
        let random_result = prng.value * total_red_strength;

        for (var ri: u32 = 0; ri < 4; ri++) {
            if (random_result <= red_strength_acc[ri]) {
                cell_blue_agents_out[ri] += 1;
                break;
            }
        }
    } 

    red_agents_out[i] = cell_red_agents_out;  
    blue_agents_out[i] = cell_blue_agents_out;
}

@compute @workgroup_size(workgroup_size) fn move_agents_in(
    @builtin(global_invocation_id) id: vec3<u32>
) {
    let i = id.x;
    if (i > u32(pow(hyperparameters.size, 2))) {return;}

    let neighbour_index = get_neightbour_index(i);

    var total_red_agents = 0.0;
    total_red_agents += red_agents_out[neighbour_index[0]][2]; // Move all red agents from top neightbour to this cell
    total_red_agents += red_agents_out[neighbour_index[1]][3]; // Move all red agents from right neightbour to this cell
    total_red_agents += red_agents_out[neighbour_index[2]][0]; // Move all red agents from front neightbour to this cell
    total_red_agents += red_agents_out[neighbour_index[3]][1]; // Move all red agents from bottom neightbour to this cell
    state_out[i].red_agents = total_red_agents;

    var total_blue_agents = 0.0;
    total_blue_agents += blue_agents_out[neighbour_index[0]][2]; // Move all blue agents from top neightbour to this cell
    total_blue_agents += blue_agents_out[neighbour_index[1]][3]; // Move all blue agents from right neightbour to this cell
    total_blue_agents += blue_agents_out[neighbour_index[2]][0]; // Move all blue agents from front neightbour to this cell
    total_blue_agents += blue_agents_out[neighbour_index[3]][1]; // Move all blue agents from bottom neightbour to this cell
    state_out[i].blue_agents = total_blue_agents;
    
}

@compute @workgroup_size(workgroup_size) fn calculate_order_param(
    @builtin(global_invocation_id) id: vec3<u32>
) {
    let i = id.x;
    let total_size = pow(hyperparameters.size, 2);
    if (i > u32(total_size)) {return;}

    // One over the (number of neighbours) * (the total number of cells) * (the total number of agents of both species squared)
    let neighbours = 4.0;
    let norm_factor = 1 / (neighbours * pow(hyperparameters.size, 2) * pow(2 * hyperparameters.total_agents, 2));
    
    let rho_red = state_out[i].red_agents * total_size;
    let rho_blue = state_out[i].blue_agents * total_size;
    let delta_rho = rho_red - rho_blue;

    let neighbour_indeces = get_neightbour_index(i);

    // Sum of delta rho for all neighbours
    var delta_rho_neighbours = 0.0;
    for (var ai: u32 = 0; ai < u32(neighbours); ai++) {
        let neighbour_index = neighbour_indeces[ai];
        let neighbour_rho_red = state_out[neighbour_index].red_agents * total_size; 
        let neighbour_rho_blue = state_out[neighbour_index].blue_agents * total_size;
        delta_rho_neighbours += neighbour_rho_red - neighbour_rho_blue;
    }    
    
    order_parameter_out[i] = norm_factor * delta_rho * delta_rho_neighbours;
}