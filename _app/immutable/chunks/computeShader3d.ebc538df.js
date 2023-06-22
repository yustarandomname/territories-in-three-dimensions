import{c as C,g as U,a as V}from"./_commonjsHelpers.87174ba5.js";var N={exports:{}};N.exports;(function(p){(function(l,s,u){function f(e){var r=this,o=i();r.next=function(){var t=2091639*r.s0+r.c*23283064365386963e-26;return r.s0=r.s1,r.s1=r.s2,r.s2=t-(r.c=t|0)},r.c=1,r.s0=o(" "),r.s1=o(" "),r.s2=o(" "),r.s0-=o(e),r.s0<0&&(r.s0+=1),r.s1-=o(e),r.s1<0&&(r.s1+=1),r.s2-=o(e),r.s2<0&&(r.s2+=1),o=null}function h(e,r){return r.c=e.c,r.s0=e.s0,r.s1=e.s1,r.s2=e.s2,r}function _(e,r){var o=new f(e),t=r&&r.state,n=o.next;return n.int32=function(){return o.next()*4294967296|0},n.double=function(){return n()+(n()*2097152|0)*11102230246251565e-32},n.quick=n,t&&(typeof t=="object"&&h(t,o),n.state=function(){return h(o,{})}),n}function i(){var e=4022871197,r=function(o){o=String(o);for(var t=0;t<o.length;t++){e+=o.charCodeAt(t);var n=.02519603282416938*e;e=n>>>0,n-=e,n*=e,e=n>>>0,n-=e,e+=n*4294967296}return(e>>>0)*23283064365386963e-26};return r}s&&s.exports?s.exports=_:u&&u.amd?u(function(){return _}):this.alea=_})(C,p,!1)})(N);var I=N.exports,D={exports:{}};D.exports;(function(p){(function(l,s,u){function f(i){var e=this,r="";e.x=0,e.y=0,e.z=0,e.w=0,e.next=function(){var t=e.x^e.x<<11;return e.x=e.y,e.y=e.z,e.z=e.w,e.w^=e.w>>>19^t^t>>>8},i===(i|0)?e.x=i:r+=i;for(var o=0;o<r.length+64;o++)e.x^=r.charCodeAt(o)|0,e.next()}function h(i,e){return e.x=i.x,e.y=i.y,e.z=i.z,e.w=i.w,e}function _(i,e){var r=new f(i),o=e&&e.state,t=function(){return(r.next()>>>0)/4294967296};return t.double=function(){do var n=r.next()>>>11,a=(r.next()>>>0)/4294967296,g=(n+a)/(1<<21);while(g===0);return g},t.int32=r.next,t.quick=t,o&&(typeof o=="object"&&h(o,r),t.state=function(){return h(r,{})}),t}s&&s.exports?s.exports=_:u&&u.amd?u(function(){return _}):this.xor128=_})(C,p,!1)})(D);var J=D.exports,P={exports:{}};P.exports;(function(p){(function(l,s,u){function f(i){var e=this,r="";e.next=function(){var t=e.x^e.x>>>2;return e.x=e.y,e.y=e.z,e.z=e.w,e.w=e.v,(e.d=e.d+362437|0)+(e.v=e.v^e.v<<4^(t^t<<1))|0},e.x=0,e.y=0,e.z=0,e.w=0,e.v=0,i===(i|0)?e.x=i:r+=i;for(var o=0;o<r.length+64;o++)e.x^=r.charCodeAt(o)|0,o==r.length&&(e.d=e.x<<10^e.x>>>4),e.next()}function h(i,e){return e.x=i.x,e.y=i.y,e.z=i.z,e.w=i.w,e.v=i.v,e.d=i.d,e}function _(i,e){var r=new f(i),o=e&&e.state,t=function(){return(r.next()>>>0)/4294967296};return t.double=function(){do var n=r.next()>>>11,a=(r.next()>>>0)/4294967296,g=(n+a)/(1<<21);while(g===0);return g},t.int32=r.next,t.quick=t,o&&(typeof o=="object"&&h(o,r),t.state=function(){return h(r,{})}),t}s&&s.exports?s.exports=_:u&&u.amd?u(function(){return _}):this.xorwow=_})(C,p,!1)})(P);var K=P.exports,B={exports:{}};B.exports;(function(p){(function(l,s,u){function f(i){var e=this;e.next=function(){var o=e.x,t=e.i,n,a;return n=o[t],n^=n>>>7,a=n^n<<24,n=o[t+1&7],a^=n^n>>>10,n=o[t+3&7],a^=n^n>>>3,n=o[t+4&7],a^=n^n<<7,n=o[t+7&7],n=n^n<<13,a^=n^n<<9,o[t]=a,e.i=t+1&7,a};function r(o,t){var n,a=[];if(t===(t|0))a[0]=t;else for(t=""+t,n=0;n<t.length;++n)a[n&7]=a[n&7]<<15^t.charCodeAt(n)+a[n+1&7]<<13;for(;a.length<8;)a.push(0);for(n=0;n<8&&a[n]===0;++n);for(n==8?a[7]=-1:a[n],o.x=a,o.i=0,n=256;n>0;--n)o.next()}r(e,i)}function h(i,e){return e.x=i.x.slice(),e.i=i.i,e}function _(i,e){i==null&&(i=+new Date);var r=new f(i),o=e&&e.state,t=function(){return(r.next()>>>0)/4294967296};return t.double=function(){do var n=r.next()>>>11,a=(r.next()>>>0)/4294967296,g=(n+a)/(1<<21);while(g===0);return g},t.int32=r.next,t.quick=t,o&&(o.x&&h(o,r),t.state=function(){return h(r,{})}),t}s&&s.exports?s.exports=_:u&&u.amd?u(function(){return _}):this.xorshift7=_})(C,p,!1)})(B);var L=B.exports,F={exports:{}};F.exports;(function(p){(function(l,s,u){function f(i){var e=this;e.next=function(){var o=e.w,t=e.X,n=e.i,a,g;return e.w=o=o+1640531527|0,g=t[n+34&127],a=t[n=n+1&127],g^=g<<13,a^=a<<17,g^=g>>>15,a^=a>>>12,g=t[n]=g^a,e.i=n,g+(o^o>>>16)|0};function r(o,t){var n,a,g,m,j,M=[],$=128;for(t===(t|0)?(a=t,t=null):(t=t+"\0",a=0,$=Math.max($,t.length)),g=0,m=-32;m<$;++m)t&&(a^=t.charCodeAt((m+32)%t.length)),m===0&&(j=a),a^=a<<10,a^=a>>>15,a^=a<<4,a^=a>>>13,m>=0&&(j=j+1640531527|0,n=M[m&127]^=a+j,g=n==0?g+1:0);for(g>=128&&(M[(t&&t.length||0)&127]=-1),g=127,m=4*128;m>0;--m)a=M[g+34&127],n=M[g=g+1&127],a^=a<<13,n^=n<<17,a^=a>>>15,n^=n>>>12,M[g]=a^n;o.w=j,o.X=M,o.i=g}r(e,i)}function h(i,e){return e.i=i.i,e.w=i.w,e.X=i.X.slice(),e}function _(i,e){i==null&&(i=+new Date);var r=new f(i),o=e&&e.state,t=function(){return(r.next()>>>0)/4294967296};return t.double=function(){do var n=r.next()>>>11,a=(r.next()>>>0)/4294967296,g=(n+a)/(1<<21);while(g===0);return g},t.int32=r.next,t.quick=t,o&&(o.X&&h(o,r),t.state=function(){return h(r,{})}),t}s&&s.exports?s.exports=_:u&&u.amd?u(function(){return _}):this.xor4096=_})(C,p,!1)})(F);var W=F.exports,O={exports:{}};O.exports;(function(p){(function(l,s,u){function f(i){var e=this,r="";e.next=function(){var t=e.b,n=e.c,a=e.d,g=e.a;return t=t<<25^t>>>7^n,n=n-a|0,a=a<<24^a>>>8^g,g=g-t|0,e.b=t=t<<20^t>>>12^n,e.c=n=n-a|0,e.d=a<<16^n>>>16^g,e.a=g-t|0},e.a=0,e.b=0,e.c=-1640531527,e.d=1367130551,i===Math.floor(i)?(e.a=i/4294967296|0,e.b=i|0):r+=i;for(var o=0;o<r.length+20;o++)e.b^=r.charCodeAt(o)|0,e.next()}function h(i,e){return e.a=i.a,e.b=i.b,e.c=i.c,e.d=i.d,e}function _(i,e){var r=new f(i),o=e&&e.state,t=function(){return(r.next()>>>0)/4294967296};return t.double=function(){do var n=r.next()>>>11,a=(r.next()>>>0)/4294967296,g=(n+a)/(1<<21);while(g===0);return g},t.int32=r.next,t.quick=t,o&&(typeof o=="object"&&h(o,r),t.state=function(){return h(r,{})}),t}s&&s.exports?s.exports=_:u&&u.amd?u(function(){return _}):this.tychei=_})(C,p,!1)})(O);var Y=O.exports,Q={exports:{}};const Z={},ee=Object.freeze(Object.defineProperty({__proto__:null,default:Z},Symbol.toStringTag,{value:"Module"})),te=U(ee);(function(p){(function(l,s,u){var f=256,h=6,_=52,i="random",e=u.pow(f,h),r=u.pow(2,_),o=r*2,t=f-1,n;function a(c,d,v){var x=[];d=d==!0?{entropy:!0}:d||{};var b=M(j(d.entropy?[c,q(s)]:c??$(),3),x),z=new g(x),w=function(){for(var y=z.g(h),k=e,S=0;y<r;)y=(y+S)*f,k*=f,S=z.g(1);for(;y>=o;)y/=2,k/=2,S>>>=1;return(y+S)/k};return w.int32=function(){return z.g(4)|0},w.quick=function(){return z.g(4)/4294967296},w.double=w,M(q(z.S),s),(d.pass||v||function(y,k,S,A){return A&&(A.S&&m(A,z),y.state=function(){return m(z,{})}),S?(u[i]=y,k):y})(w,b,"global"in d?d.global:this==u,d.state)}function g(c){var d,v=c.length,x=this,b=0,z=x.i=x.j=0,w=x.S=[];for(v||(c=[v++]);b<f;)w[b]=b++;for(b=0;b<f;b++)w[b]=w[z=t&z+c[b%v]+(d=w[b])],w[z]=d;(x.g=function(y){for(var k,S=0,A=x.i,R=x.j,E=x.S;y--;)k=E[A=t&A+1],S=S*f+E[t&(E[A]=E[R=t&R+k])+(E[R]=k)];return x.i=A,x.j=R,S})(f)}function m(c,d){return d.i=c.i,d.j=c.j,d.S=c.S.slice(),d}function j(c,d){var v=[],x=typeof c,b;if(d&&x=="object")for(b in c)try{v.push(j(c[b],d-1))}catch{}return v.length?v:x=="string"?c:c+"\0"}function M(c,d){for(var v=c+"",x,b=0;b<v.length;)d[t&b]=t&(x^=d[t&b]*19)+v.charCodeAt(b++);return q(d)}function $(){try{var c;return n&&(c=n.randomBytes)?c=c(f):(c=new Uint8Array(f),(l.crypto||l.msCrypto).getRandomValues(c)),q(c)}catch{var d=l.navigator,v=d&&d.plugins;return[+new Date,l,v,l.screen,q(s)]}}function q(c){return String.fromCharCode.apply(0,c)}if(M(u.random(),s),p.exports){p.exports=a;try{n=te}catch{}}else u["seed"+i]=a})(typeof self<"u"?self:C,[],Math)})(Q);var ne=Q.exports,re=I,ie=J,oe=K,ae=L,se=W,ue=Y,X=ne;X.alea=re;X.xor128=ie;X.xorwow=oe;X.xorshift7=ae;X.xor4096=se;X.tychei=ue;var le=X;const _e=V(le);function T(p,l,s){return Math.floor(p.quick()*(s-l)+l)}class H{constructor(l,s,u,f,h,_){this.red_agents=l,this.blue_agents=s,this.red_graffiti=u,this.blue_graffiti=f,this.red_strength=h,this.blue_strength=_}clone(){return new H(this.red_agents,this.blue_agents,this.red_graffiti,this.blue_graffiti,this.red_strength,this.blue_strength)}}class G{constructor(l,s,u,f){this.size=l,this.total_agents=s,this.dimensions=u,this.seed=f;let h=_e(f.toString()+u.toString()+l.toString()+s.toString());this.total_size=Math.pow(l,u);let _=Math.floor(s/this.total_size);for(let i=0;i<this.total_size;i++){let e=new H(_,_,0,0,0,0);this.nodes.push(e)}for(let i=0;i<s-_*this.total_size;i++){let e=T(h,0,this.total_size);this.nodes[e].red_agents++}for(let i=0;i<s-_*this.total_size;i++){let e=T(h,0,this.total_size);this.nodes[e].blue_agents++}}nodes=[];total_size;to_f32_buffer(){let l=new Float32Array(this.nodes.length*6);for(let s=0;s<this.nodes.length;s++){let u=this.nodes[s];l[s*6+0]=u.red_agents,l[s*6+1]=u.blue_agents,l[s*6+2]=u.red_graffiti,l[s*6+3]=u.blue_graffiti,l[s*6+4]=u.red_strength,l[s*6+5]=u.blue_strength}return l}clone(){let l=new G(this.size,0,this.dimensions,this.seed);return l.nodes=this.nodes.map(s=>s.clone()),l}isChanged(l){return l.size!==this.size||l.total_agents!==this.total_agents||l.seed!==this.seed}static from_result(l,s,u,f){let h=new G(s,0,u,f);for(let _=0;_<h.nodes.length;_++){let i=h.nodes[_];i.red_agents=l[_*6+0],i.blue_agents=l[_*6+1],i.red_graffiti=l[_*6+2],i.blue_graffiti=l[_*6+3],i.red_strength=l[_*6+4],i.blue_strength=l[_*6+5]}return h}}const fe=`struct HyperParams {
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

@group(0) @binding(3) var<storage, read_write> red_agents_out: array<array<f32, 6>>;
@group(0) @binding(4) var<storage, read_write> blue_agents_out: array<array<f32, 6>>;

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


/*
* @param i: index of node
* @return array of 6 indeces of neighbours
*/
fn get_neightbour_index(i: u32) -> array<u32, 6> {
    let size = u32(hyperparameters.size);
    
    let x = i % size;
    let y = (i / size) % size;
    let z = i / (size * size);

    let left_index = z * size * size + y * size + (x + size - 1) % size;
    let right_index = z * size * size + y * size + (x + 1) % size;
    let top_index = z * size * size + (y + size - 1) % size * size + x;
    let bottom_index = z * size * size + (y + 1) % size * size + x;
    let front_index = (z + size - 1) % size * size * size + y * size + x;
    let back_index = (z + 1) % size * size * size + y * size + x;

    return array<u32, 6>(top_index, right_index, front_index, bottom_index, left_index, back_index);
}


/**
 * @param neighbour_indeces: array of 6 indeces of neighbours
 * @return vec2<f32>: total red strength, total blue strength
 */
fn total_strength(neighbour_indeces: array<u32, 6>) -> vec2<f32> {
    var total_red_strength = 0.0;
    var total_blue_strength = 0.0;

    for (var i = 0u; i < 6u; i = i + 1u) {
        total_red_strength += state_out[neighbour_indeces[i]].red_strength;
        total_blue_strength += state_out[neighbour_indeces[i]].blue_strength;
    }

    return vec2<f32>(total_red_strength, total_blue_strength);
}

@compute @workgroup_size(workgroup_size) fn update_graffiti_and_push_strength(
    @builtin(global_invocation_id) id: vec3<u32>
) {
    let i = id.x;
    if (i > u32(pow(hyperparameters.size, 3))) {return;} // Quick return if out of bounds

    let e = 2.71828;
    let xi_str = pow(hyperparameters.size, 2);

    let lambda = 1.0 - hyperparameters.lambda;
    let gamma = hyperparameters.gamma;
    let beta = hyperparameters.beta * xi_str;

    var red_graffiti = state_in[i].red_graffiti * lambda;
    var blue_graffiti = state_in[i].blue_graffiti * lambda;

    let seed = vec4<u32>(id.x, id.x * 377, id.x * 397, id.x * 121);
    var prng = random(seed);
    
    // Make this a hyper parameter
    if (true) {
        red_graffiti += state_in[i].red_agents * gamma;
        blue_graffiti += state_in[i].blue_agents * gamma;
    } else {
        for (var ri: u32 = 0; ri < u32(state_in[i].red_agents); ri++) {
            prng = random(prng.state);

            if (prng.value >= 0.5) {
                red_graffiti += 1;
            }
        }

        for (var bi: u32 = 0; bi < u32(state_in[i].blue_agents); bi++) {
            prng = random(prng.state);

            if (prng.value >= 0.5) {
                blue_graffiti += 1;
            }
        }
    }

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
    if (i > u32(pow(hyperparameters.size, 3))) {return;}
    
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
    var cell_red_agents_out = array<f32, 6>(0, 0, 0, 0, 0, 0);
    var cell_blue_agents_out = array<f32, 6>(0, 0, 0, 0, 0, 0);

    // Accumulate strengths of neighbours - used for calculating probabilities
    var red_strength_acc = array<f32, 6>(state_out[neighbour_index[0]].red_strength, 0, 0, 0, 0, 0);
    var blue_strenths_acc = array<f32, 6>(state_out[neighbour_index[0]].blue_strength, 0, 0, 0, 0, 0);

    for (var bi: u32 = 1; bi < 6; bi++) {
        red_strength_acc[bi] = red_strength_acc[bi-1] + state_out[neighbour_index[bi]].red_strength;
        blue_strenths_acc[bi] = blue_strenths_acc[bi-1] + state_out[neighbour_index[bi]].blue_strength;
    }
    
    // Move each red agent
    for (var ri: u32 = 0; ri < u32(state_in[i].red_agents); ri++) {
        prng = random(prng.state);
        let random_result = prng.value * total_blue_strength;

        for (var bi: u32 = 0; bi < 6; bi++) {
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

        for (var ri: u32 = 0; ri < 6; ri++) {
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
    if (i > u32(pow(hyperparameters.size, 3))) {return;}

    let neighbour_index = get_neightbour_index(i);

    var total_red_agents = 0.0;
    total_red_agents += red_agents_out[neighbour_index[0]][3]; // Move all red agents from top neightbour to this cell
    total_red_agents += red_agents_out[neighbour_index[1]][4]; // Move all red agents from right neightbour to this cell
    total_red_agents += red_agents_out[neighbour_index[2]][5]; // Move all red agents from front neightbour to this cell
    total_red_agents += red_agents_out[neighbour_index[3]][0]; // Move all red agents from bottom neightbour to this cell
    total_red_agents += red_agents_out[neighbour_index[4]][1]; // Move all red agents from left neightbour to this cell
    total_red_agents += red_agents_out[neighbour_index[5]][2]; // Move all red agents from back neightbour to this cell
    state_out[i].red_agents = total_red_agents;

    var total_blue_agents = 0.0;
    total_blue_agents += blue_agents_out[neighbour_index[0]][3]; // Move all blue agents from top neightbour to this cell
    total_blue_agents += blue_agents_out[neighbour_index[1]][4]; // Move all blue agents from right neightbour to this cell
    total_blue_agents += blue_agents_out[neighbour_index[2]][5]; // Move all blue agents from front neightbour to this cell
    total_blue_agents += blue_agents_out[neighbour_index[3]][0]; // Move all blue agents from bottom neightbour to this cell
    total_blue_agents += blue_agents_out[neighbour_index[4]][1]; // Move all blue agents from left neightbour to this cell
    total_blue_agents += blue_agents_out[neighbour_index[5]][2]; // Move all blue agents from back neightbour to this cell
    state_out[i].blue_agents = total_blue_agents;
}

@compute @workgroup_size(workgroup_size) fn calculate_order_param(
    @builtin(global_invocation_id) id: vec3<u32>
) {
    let i = id.x;
    let total_size = pow(hyperparameters.size, 3);
    if (i > u32(total_size)) {return;}

    // One over the (number of neighbours) * (the total number of cells) * (the total number of agents of both species squared)
    let neighbours = 6.0;
    let norm_factor = 1 / (neighbours * pow(hyperparameters.size, 3) * pow(2 * hyperparameters.total_agents, 2));
    
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
`;export{G as U,fe as c};
