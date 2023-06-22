import{S as oe,i as se,s as ue,k as E,q as U,a as R,e as W,l as T,m as L,r as G,h as d,c as x,n as J,b as v,G as S,u as H,d as $,f as ne,g as C,o as le,v as ae,L as ie,w as _e,X as fe,y as j,z as K,J as V,A as Q,K as Z,Y as ge,B as X,M as pe,H as q}from"../chunks/index.2ecf17a4.js";import{U as ee}from"../chunks/computeShader3d.ebc538df.js";import{H as be}from"../chunks/gpuStore.3315e7be.js";import{C as de}from"../chunks/Canvas.1312a6b0.js";import{I as ce}from"../chunks/Input.f5150092.js";import{B as he}from"../chunks/Button.14bf8c2c.js";const me=`struct HyperParams {
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
}`;async function ye(n,r,o){const i=n.createShaderModule({label:"compute module",code:me}),a=Math.pow(o.size,2),u=r.universeArray,l=r.hyperparamsArray,g=n.createBuffer({label:"Grid Uniforms",size:l.byteLength,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});n.queue.writeBuffer(g,0,l);const f=[n.createBuffer({label:"Cell State A",size:u.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),n.createBuffer({label:"Cell State B",size:u.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST})];n.queue.writeBuffer(f[0],0,u);const y=new Float32Array(u.length),b=[n.createBuffer({label:"Agents Out red",size:y.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),n.createBuffer({label:"Agents Out blue",size:y.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST})];n.queue.writeBuffer(b[0],0,y),n.queue.writeBuffer(b[1],0,new Float32Array(u.length));const p=n.createBuffer({label:"result buffer",size:u.byteLength,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),P=new Float32Array(a),t=n.createBuffer({label:"order buffer",size:P.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC}),_=n.createBuffer({label:"order result buffer",size:P.byteLength,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),B=n.createBindGroupLayout({label:"Cell Bind Group Layout",entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,buffer:{type:"uniform"}},{binding:1,visibility:GPUShaderStage.COMPUTE,buffer:{type:"read-only-storage"}},{binding:2,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:3,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:4,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:5,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}}]});function z(m,c){const w=c.createPipelineLayout({label:"Cell Pipeline Layout",bindGroupLayouts:[B]}),k=c.createComputePipeline({label:`${m} pipeline`,layout:w,compute:{module:i,entryPoint:m}}),N=[c.createBindGroup({label:`BindGroup for ${m}, group A`,layout:B,entries:[{binding:0,resource:{buffer:g}},{binding:1,resource:{buffer:f[0]}},{binding:2,resource:{buffer:f[1]}},{binding:3,resource:{buffer:b[0]}},{binding:4,resource:{buffer:b[1]}},{binding:5,resource:{buffer:t}}]}),c.createBindGroup({label:`BindGroup for ${m}, group B`,layout:B,entries:[{binding:0,resource:{buffer:g}},{binding:1,resource:{buffer:f[1]}},{binding:2,resource:{buffer:f[0]}},{binding:3,resource:{buffer:b[0]}},{binding:4,resource:{buffer:b[1]}},{binding:5,resource:{buffer:t}}]})];return{pipeline:k,bindGroups:N}}return{pipelines:{update_graffiti_and_push_strength:z("update_graffiti_and_push_strength",n),move_agents_out:z("move_agents_out",n),move_agents_in:z("move_agents_in",n),calculate_order_param:z("calculate_order_param",n)},outputBuffers:{resultBuffer:p,orderResultBuffer:_},storageBuffers:{cellStateStorage:f,agentsOutBuffers:b,orderBuffer:t}}}function ve(n){let r,o,i,a,u,l,g,f,y,b,p,P,t,_,B,z,A=JSON.stringify(n[2])+"",O,D,m,c,w,k;function N(e){n[10](e)}let F={label:"beta",input:n[5].beta.toExponential()};n[5].beta!==void 0&&(F.value=n[5].beta),p=new ce({props:F}),_e.push(()=>fe(p,"value",N)),_=new he({props:{selected:!0,$$slots:{default:[ze]},$$scope:{ctx:n}}}),_.$on("click",n[11]);let h=n[4]&&te(n);return{c(){r=E("p"),o=U("Nice we are loaded"),i=R(),a=E("input"),u=R(),l=E("button"),g=U("iterate "),f=U(n[3]),y=U(" times"),b=R(),j(p.$$.fragment),t=R(),j(_.$$.fragment),B=R(),z=E("p"),O=U(A),D=R(),h&&h.c(),m=W(),this.h()},l(e){r=T(e,"P",{});var s=L(r);o=G(s,"Nice we are loaded"),s.forEach(d),i=x(e),a=T(e,"INPUT",{type:!0}),u=x(e),l=T(e,"BUTTON",{});var M=L(l);g=G(M,"iterate "),f=G(M,n[3]),y=G(M," times"),M.forEach(d),b=x(e),K(p.$$.fragment,e),t=x(e),K(_.$$.fragment,e),B=x(e),z=T(e,"P",{class:!0});var Y=L(z);O=G(Y,A),Y.forEach(d),D=x(e),h&&h.l(e),m=W(),this.h()},h(){J(a,"type","number"),J(z,"class","m-4")},m(e,s){v(e,r,s),S(r,o),v(e,i,s),v(e,a,s),V(a,n[3]),v(e,u,s),v(e,l,s),S(l,g),S(l,f),S(l,y),v(e,b,s),Q(p,e,s),v(e,t,s),Q(_,e,s),v(e,B,s),v(e,z,s),S(z,O),v(e,D,s),h&&h.m(e,s),v(e,m,s),c=!0,w||(k=[Z(a,"input",n[8]),Z(l,"click",n[9])],w=!0)},p(e,s){s&8&&ie(a.value)!==e[3]&&V(a,e[3]),(!c||s&8)&&H(f,e[3]);const M={};s&32&&(M.input=e[5].beta.toExponential()),!P&&s&32&&(P=!0,M.value=e[5].beta,ge(()=>P=!1)),p.$set(M);const Y={};s&131072&&(Y.$$scope={dirty:s,ctx:e}),_.$set(Y),(!c||s&4)&&A!==(A=JSON.stringify(e[2])+"")&&H(O,A),e[4]?h?(h.p(e,s),s&16&&C(h,1)):(h=te(e),h.c(),C(h,1),h.m(m.parentNode,m)):h&&(ae(),$(h,1,1,()=>{h=null}),ne())},i(e){c||(C(p.$$.fragment,e),C(_.$$.fragment,e),C(h),c=!0)},o(e){$(p.$$.fragment,e),$(_.$$.fragment,e),$(h),c=!1},d(e){e&&d(r),e&&d(i),e&&d(a),e&&d(u),e&&d(l),e&&d(b),X(p,e),e&&d(t),X(_,e),e&&d(B),e&&d(z),e&&d(D),h&&h.d(e),e&&d(m),w=!1,pe(k)}}}function Be(n){let r,o;return{c(){r=E("p"),o=U("We are loading")},l(i){r=T(i,"P",{});var a=L(r);o=G(a,"We are loading"),a.forEach(d)},m(i,a){v(i,r,a),S(r,o)},p:q,i:q,o:q,d(i){i&&d(r)}}}function Pe(n){let r,o,i;return{c(){r=E("p"),o=U("Something went wrong: "),i=U(n[0])},l(a){r=T(a,"P",{});var u=L(r);o=G(u,"Something went wrong: "),i=G(u,n[0]),u.forEach(d)},m(a,u){v(a,r,u),S(r,o),S(r,i)},p(a,u){u&1&&H(i,a[0])},i:q,o:q,d(a){a&&d(r)}}}function ze(n){let r;return{c(){r=U("Reset and iterate")},l(o){r=G(o,"Reset and iterate")},m(o,i){v(o,r,i)},d(o){o&&d(r)}}}function te(n){let r,o;return r=new de({props:{universe:n[4]}}),{c(){j(r.$$.fragment)},l(i){K(r.$$.fragment,i)},m(i,a){Q(r,i,a),o=!0},p(i,a){const u={};a&16&&(u.universe=i[4]),r.$set(u)},i(i){o||(C(r.$$.fragment,i),o=!0)},o(i){$(r.$$.fragment,i),o=!1},d(i){X(r,i)}}}function we(n){let r,o,i=n[5].iterations+"",a,u,l,g,f,y;const b=[Pe,Be,ve],p=[];function P(t,_){return t[0]?0:t[1]?1:2}return l=P(n),g=p[l]=b[l](n),{c(){r=E("h1"),o=U("Iterations run: "),a=U(i),u=R(),g.c(),f=W(),this.h()},l(t){r=T(t,"H1",{class:!0});var _=L(r);o=G(_,"Iterations run: "),a=G(_,i),_.forEach(d),u=x(t),g.l(t),f=W(),this.h()},h(){J(r,"class","text-3xl")},m(t,_){v(t,r,_),S(r,o),S(r,a),v(t,u,_),p[l].m(t,_),v(t,f,_),y=!0},p(t,[_]){(!y||_&32)&&i!==(i=t[5].iterations+"")&&H(a,i);let B=l;l=P(t),l===B?p[l].p(t,_):(ae(),$(p[B],1,1,()=>{p[B]=null}),ne(),g=p[l],g?g.p(t,_):(g=p[l]=b[l](t),g.c()),C(g,1),g.m(f.parentNode,f))},i(t){y||(C(g),y=!0)},o(t){$(g),y=!1},d(t){t&&d(r),t&&d(u),p[l].d(t),t&&d(f)}}}const I=12345;let re=5e5;function Ue(n,r,o){let i,a,u,l,g,f=!0,y=[],b=1e4,p=new ee(100,re,2,I);console.log(p.total_size);let P;const t={lambda:.5,gamma:.5,beta:5*1e-5,size:p.size,iterations:0,total_agents:re,seed:I};async function _(){o(5,t.iterations=0,t),o(2,y=[]);const m=new Float32Array([t.lambda,t.gamma,t.beta,t.size,t.iterations,t.total_agents,t.seed]),c=new Float32Array(p.to_f32_buffer()),w=await ye(i,{hyperparamsArray:m,universeArray:c},be.fromObject(t));a=w.pipelines,l=w.storageBuffers,u=w.outputBuffers}le(async()=>{o(1,f=!0);const c=await(await navigator.gpu?.requestAdapter({powerPreference:"high-performance"}))?.requestDevice();if(!c){console.log("need a browser that supports WebGPU"),o(0,g="need a browser that supports WebGPU this demo only works in Chrome version 114+ ");return}i=c,await _(),o(0,g=""),o(1,f=!1)});async function B(m){if(!a||f||!i)return;o(1,f=!0),console.log(t);const c=i.createCommandEncoder(),w=Math.ceil(Math.pow(t.size,2)/100);for(let e=0;e<m;e++){const s=c.beginComputePass();s.setPipeline(a.update_graffiti_and_push_strength.pipeline),s.setBindGroup(0,a.update_graffiti_and_push_strength.bindGroups[t.iterations%2]),s.dispatchWorkgroups(w,1,1),s.setPipeline(a.move_agents_out.pipeline),s.setBindGroup(0,a.move_agents_out.bindGroups[t.iterations%2]),s.dispatchWorkgroups(w,1,1),s.setPipeline(a.move_agents_in.pipeline),s.setBindGroup(0,a.move_agents_in.bindGroups[t.iterations%2]),s.dispatchWorkgroups(w,1,1),o(5,t.iterations++,t),s.end()}const k=c.beginComputePass();k.setPipeline(a.calculate_order_param.pipeline),k.setBindGroup(0,a.calculate_order_param.bindGroups[t.iterations%2]),k.dispatchWorkgroups(w,1,1),k.end(),c.copyBufferToBuffer(l.cellStateStorage[(t.iterations+1)%2],0,u.resultBuffer,0,u.resultBuffer.size),c.copyBufferToBuffer(l.orderBuffer,0,u.orderResultBuffer,0,u.orderResultBuffer.size),i.queue.submit([c.finish()]),await u.resultBuffer.mapAsync(GPUMapMode.READ);const N=new Float32Array(u.resultBuffer.getMappedRange().slice(0));u.resultBuffer.unmap(),o(4,P=ee.from_result(N,t.size,2,I)),console.log("output",P.nodes.slice(0,10)),console.log("red_agents",P.nodes.reduce((e,s)=>e+s.red_agents,0)),await u.orderResultBuffer.mapAsync(GPUMapMode.READ);const F=new Float32Array(u.orderResultBuffer.getMappedRange().slice(0));u.orderResultBuffer.unmap();const h=[...F].reduce((e,s)=>e+s,0);o(2,y=[...y,{iteration:t.iterations,orderParam:h}]),o(1,f=!1)}function z(){b=ie(this.value),o(3,b)}const A=async()=>{console.time(`Time to iterate total: ${b}`),await B(b),console.timeEnd(`Time to iterate total: ${b}`)};function O(m){n.$$.not_equal(t.beta,m)&&(t.beta=m,o(5,t))}return[g,f,y,b,P,t,_,B,z,A,O,async()=>{await _(),B(b)}]}class Oe extends oe{constructor(r){super(),se(this,r,Ue,we,ue,{})}}export{Oe as component};
