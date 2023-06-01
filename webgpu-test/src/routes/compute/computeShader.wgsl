struct Node {
    red_agents: f32,
    blue_agents: f32,
    red_graffiti: f32,
    blue_graffiti: f32,
    red_strength: f32,
    blue_strength: f32,
}

// @group(0) var<uniform> hyperparameters: vec3<f32>; // 0: lambda, 1: gamma, 2: beta

// Euler's number

@group(0) @binding(0) var<storage, read_write> data: array<Node>;

@compute @workgroup_size(10) fn update_graffiti_and_push_strength(
    @builtin(global_invocation_id) id: vec3<u32>
) {
    let i = id.x;
    
    let e = 2.71828;
    let lambda = 0.5;
    let gamma = 0.5;
    let beta = 0.01;


    data[i].red_graffiti = data[i].red_graffiti * (1.0 - lambda) + data[i].red_agents * gamma;
    data[i].blue_graffiti = data[i].blue_graffiti * (1.0 - lambda) + data[i].blue_agents * gamma;
    data[i].red_strength = pow(e, (beta * data[i].red_graffiti));
    data[i].blue_strength = pow(e, (beta * data[i].blue_graffiti));
}

@compute @workgroup_size(10) fn move_agents(
    @builtin(global_invocation_id) id: vec3<u32>
) {
    let i = id.x;
    
    data[i].red_agents = data[i].red_agents + 90000.0;
    data[i].red_graffiti = data[i].red_graffiti + 90000.0;
}