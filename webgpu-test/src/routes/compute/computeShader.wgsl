struct HyperParams {
    lambda: f32,
    gamma: f32,
    beta: f32,
    size: f32, // length of one side of grid
    iterations: f32,
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

@group(0) @binding(0) var<uniform> hyperparameters: HyperParams; 
@group(0) @binding(1) var<storage> state_in: array<Node>; 
@group(0) @binding(2) var<storage, read_write> state_out: array<Node>;

@group(0) @binding(3) var<storage, read_write> red_agents_out: array<array<f32, 4>>;
@group(0) @binding(4) var<storage, read_write> blue_agents_out: array<array<f32, 4>>;

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
    let y = i / size; 

    let topIndex = x + ((size + y - 1) % size) * size;
    let rightIndex = ((x + 1) % size) + y * size;
    let bottomIndex = x + ((y + 1) % size) * size;
    let leftIndex = ((size + x - 1) % size) + y * size;

    return array<u32, 4>(topIndex, rightIndex, bottomIndex, leftIndex);
}

@compute @workgroup_size(10) fn update_graffiti_and_push_strength(
    @builtin(global_invocation_id) id: vec3<u32>
) {
    let i = id.x;
    
    let e = 2.71828;
    let lambda = 0.5;
    let gamma = 0.5;
    let beta = 0.01;

    let red_graffiti = state_in[i].red_graffiti * (1.0 - lambda) + f32(state_in[i].red_agents) * gamma;
    let blue_graffiti = state_in[i].blue_graffiti * (1.0 - lambda) + f32(state_in[i].blue_agents) * gamma;

    state_out[i].red_graffiti = red_graffiti;
    state_out[i].blue_graffiti = blue_graffiti;
    state_out[i].red_strength = pow(e, (-beta * red_graffiti));
    state_out[i].blue_strength = pow(e, (-beta * blue_graffiti));
}

@compute @workgroup_size(10) fn move_agents_out(
    @builtin(global_invocation_id) id: vec3<u32>
) {
    let i = id.x;
    
    let neighbour_index = get_neightbour_index(i);

    let total_red_strength = state_out[neighbour_index[0]].red_strength + state_out[neighbour_index[1]].red_strength + state_out[neighbour_index[2]].red_strength + state_out[neighbour_index[3]].red_strength;
    let total_blue_strength = state_out[neighbour_index[0]].blue_strength + state_out[neighbour_index[1]].blue_strength + state_out[neighbour_index[2]].blue_strength + state_out[neighbour_index[3]].blue_strength;

    // 1) For each species (red and blue), for each agent, calculate the probability of moving to each neighbour
    // based on the strength of the opposites graffiti in that neighbour
    // 2)Then, randomly select a neighbour to move to based on the probabilities
    
    // Seed with neighbour indeces
    var prng = random(vec4<u32>(neighbour_index[0] >> 5, neighbour_index[1] << 5, neighbour_index[2] >> 10, neighbour_index[3] << 10));
    prng = random(prng.state);

    // red_agents_out[i][1] = state_in[i].red_agents; // Move all agents to right neighbour
    var cell_red_agents_out = array<f32, 4>(0, 0, 0, 0);
    var cell_blue_agents_out = array<f32, 4>(0, 0, 0, 0);

    // Move each red agent
    for (var ri: u32 = 0; ri < u32(state_in[i].red_agents); ri++) {
        prng = random(prng.state);

        let random_result = random(prng.state).value * total_blue_strength;

        if (random_result < state_out[neighbour_index[0]].blue_strength) {
            // Move to top
            cell_red_agents_out[0] += 1;
        } else if (random_result < state_out[neighbour_index[0]].blue_strength + state_out[neighbour_index[1]].blue_strength) {
            // Move to right
            cell_red_agents_out[1] += 1;
        } else if (random_result < state_out[neighbour_index[0]].blue_strength + state_out[neighbour_index[1]].blue_strength + state_out[neighbour_index[2]].blue_strength) {
            // Move to bottom
            cell_red_agents_out[2] += 1;
        } else {
            // Move to left
            cell_red_agents_out[3] += 1;
        }
    }  

    // Move each blue agent
    for (var bi: u32 = 0; bi < u32(state_in[i].blue_agents); bi++) {
        prng = random(prng.state);
        let random_result = random(prng.state).value * total_red_strength;

        if (random_result < state_out[neighbour_index[0]].red_strength) {
            // Move to top
            cell_blue_agents_out[0] += 1;
        } else if (random_result < state_out[neighbour_index[0]].red_strength + state_out[neighbour_index[1]].red_strength) {
            // Move to right
            cell_blue_agents_out[1] += 1;
        } else if (random_result < state_out[neighbour_index[0]].red_strength + state_out[neighbour_index[1]].red_strength + state_out[neighbour_index[2]].red_strength) {
            // Move to bottom
            cell_blue_agents_out[2] += 1;
        } else {
            // Move to left
            cell_blue_agents_out[3] += 1;
        }
    } 

    red_agents_out[i] = cell_red_agents_out;  
    blue_agents_out[i] = cell_blue_agents_out;
}

@compute @workgroup_size(10) fn move_agents_in(
    @builtin(global_invocation_id) id: vec3<u32>
) {
    let i = id.x;
    
    let neighbour_index = get_neightbour_index(i);

    state_out[i].red_agents += red_agents_out[neighbour_index[0]][2]; // Move all red agents from top neightbour to this cell
    state_out[i].red_agents += red_agents_out[neighbour_index[1]][3]; // Move all red agents from right neightbour to this cell
    state_out[i].red_agents += red_agents_out[neighbour_index[2]][0]; // Move all red agents from left neightbour to this cell
    state_out[i].red_agents += red_agents_out[neighbour_index[3]][1]; // Move all red agents from left neightbour to this cell

    state_out[i].blue_agents += blue_agents_out[neighbour_index[0]][2]; // Move all blue agents from top neightbour to this cell
    state_out[i].blue_agents += blue_agents_out[neighbour_index[1]][3]; // Move all blue agents from right neightbour to this cell
    state_out[i].blue_agents += blue_agents_out[neighbour_index[2]][0]; // Move all blue agents from left neightbour to this cell
    state_out[i].blue_agents += blue_agents_out[neighbour_index[3]][1]; // Move all blue agents from left neightbour to this cell
}