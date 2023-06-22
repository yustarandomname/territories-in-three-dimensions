import{w as U}from"./index.0449cfc6.js";import{c as O}from"./computeShader3d.ebc538df.js";import{a4 as m}from"./index.2ecf17a4.js";async function z(e,t,a){const o=e.createShaderModule({label:"compute module",code:O}),u=Math.pow(a.size,3),r=t.universeArray,s=t.hyperparamsArray,i=e.createBuffer({label:"Grid Uniforms",size:s.byteLength,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});e.queue.writeBuffer(i,0,s);const n=[e.createBuffer({label:"Cell State A",size:r.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),e.createBuffer({label:"Cell State B",size:r.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST})];e.queue.writeBuffer(n[0],0,r);const l=new Float32Array(r.length),g=[e.createBuffer({label:"Agents Out red",size:l.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST}),e.createBuffer({label:"Agents Out blue",size:l.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST})];e.queue.writeBuffer(g[0],0,l),e.queue.writeBuffer(g[1],0,new Float32Array(r.length));const B=e.createBuffer({label:"result buffer",size:r.byteLength,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),d=new Float32Array(u),f=e.createBuffer({label:"order buffer",size:d.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC}),S=e.createBuffer({label:"order result buffer",size:d.byteLength,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),_=e.createBindGroupLayout({label:"Cell Bind Group Layout",entries:[{binding:0,visibility:GPUShaderStage.COMPUTE,buffer:{type:"uniform"}},{binding:1,visibility:GPUShaderStage.COMPUTE,buffer:{type:"read-only-storage"}},{binding:2,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:3,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:4,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}},{binding:5,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}}]});function b(h,P){const w=P.createPipelineLayout({label:"Cell Pipeline Layout",bindGroupLayouts:[_]}),A=P.createComputePipeline({label:`${h} pipeline`,layout:w,compute:{module:o,entryPoint:h}}),C=[P.createBindGroup({label:`BindGroup for ${h}, group A`,layout:_,entries:[{binding:0,resource:{buffer:i}},{binding:1,resource:{buffer:n[0]}},{binding:2,resource:{buffer:n[1]}},{binding:3,resource:{buffer:g[0]}},{binding:4,resource:{buffer:g[1]}},{binding:5,resource:{buffer:f}}]}),P.createBindGroup({label:`BindGroup for ${h}, group B`,layout:_,entries:[{binding:0,resource:{buffer:i}},{binding:1,resource:{buffer:n[1]}},{binding:2,resource:{buffer:n[0]}},{binding:3,resource:{buffer:g[0]}},{binding:4,resource:{buffer:g[1]}},{binding:5,resource:{buffer:f}}]})];return{pipeline:A,bindGroups:C}}return{pipelines:{update_graffiti_and_push_strength:b("update_graffiti_and_push_strength",e),move_agents_out:b("move_agents_out",e),move_agents_in:b("move_agents_in",e),calculate_order_param:b("calculate_order_param",e)},outputBuffers:{resultBuffer:B,orderResultBuffer:S},storageBuffers:{cellStateStorage:n,agentsOutBuffers:g,orderBuffer:f}}}async function R(e,{device:t,pipelines:a,hyperparameters:o,storageBuffers:u,outputBuffers:r}){const s={...o},i=t.createCommandEncoder(),n=Math.ceil(Math.pow(s.size,3)/100);for(let d=0;d<e;d++){const f=i.beginComputePass();f.setPipeline(a.update_graffiti_and_push_strength.pipeline),f.setBindGroup(0,a.update_graffiti_and_push_strength.bindGroups[s.iterations%2]),f.dispatchWorkgroups(n,1,1),f.setPipeline(a.move_agents_out.pipeline),f.setBindGroup(0,a.move_agents_out.bindGroups[s.iterations%2]),f.dispatchWorkgroups(n,1,1),f.setPipeline(a.move_agents_in.pipeline),f.setBindGroup(0,a.move_agents_in.bindGroups[s.iterations%2]),f.dispatchWorkgroups(n,1,1),s.iterations++,f.end()}const l=i.beginComputePass();l.setPipeline(a.calculate_order_param.pipeline),l.setBindGroup(0,a.calculate_order_param.bindGroups[s.iterations%2]),l.dispatchWorkgroups(n,1,1),l.end(),i.copyBufferToBuffer(u.cellStateStorage[(s.iterations+1)%2],0,r.resultBuffer,0,r.resultBuffer.size),i.copyBufferToBuffer(u.orderBuffer,0,r.orderResultBuffer,0,r.orderResultBuffer.size),t.queue.submit([i.finish()]),await r.resultBuffer.mapAsync(GPUMapMode.READ);const g=new Float32Array(r.resultBuffer.getMappedRange().slice(0));r.resultBuffer.unmap(),await r.orderResultBuffer.mapAsync(GPUMapMode.READ);const B=new Float32Array(r.orderResultBuffer.getMappedRange().slice(0));return r.orderResultBuffer.unmap(),{result:g,orderResult:B}}function T(){const{subscribe:e,set:t}=U({loading:!1});return{subscribe:e,set:a=>t({loading:!0,message:a}),reset:()=>t({loading:!1})}}function E(){const{subscribe:e,set:t}=U({hasError:!1});return{subscribe:e,set:a=>{p.reset(),t({hasError:!0,message:a})},reset:()=>t({hasError:!1})}}const p=T(),c=E();class y{constructor(t,a,o,u,r,s,i){this.lambda=t,this.gamma=a,this.beta=o,this.size=u,this.iterations=r,this.total_agents=s,this.seed=i}static fromObject(t){return new y(t.lambda,t.gamma,t.beta,t.size,t.iterations,t.total_agents,t.seed)}get mass(){return this.total_agents*2}get total_size(){return this.size*this.size*this.size}get agents_per_cell(){return this.total_agents/this.total_size}toString(){return`lambda=${this.lambda},gamma=${this.gamma},beta=${this.beta},size=${this.size},iterations=${this.iterations},total_agents=${this.total_agents},seed=${this.seed}`}}function M(){const{subscribe:e,set:t,update:a}=U({device:null});return{subscribe:e,init:async()=>{p.set("Initializing GPU");const u=await(await navigator.gpu?.requestAdapter({powerPreference:"high-performance"}))?.requestDevice();if(!u){c.set("No GPU found. You need a browser that supports WebGPU. This demo only works in Chrome version 114+ on Desktop computers.");return}t({device:u}),p.reset(),c.reset()},setup:async(o,u)=>{p.set("Setting up GPU");const r=m(G).device;if(!r){c.set("No GPU found. You need a browser that supports WebGPU. This demo only works in Chrome version 114+ on Desktop computers.");return}const s=new Float32Array(Object.values(o));console.log(s);const i=await z(r,{hyperparamsArray:s,universeArray:u},o);await a(n=>n.device?{device:n.device,hyperparameters:o,storageBuffers:i.storageBuffers,outputBuffers:i.outputBuffers,pipelines:i.pipelines}:n),p.reset(),c.reset()},iterate:async o=>{p.set("Iterating to next generation with amount: "+o);const u=m(G);if(!("outputBuffers"in u)){c.set("GPU not initialized. Please reload the page.");return}const r=await R(o,u);return a(s=>"outputBuffers"in s?(s.hyperparameters.iterations+=o,s):(c.set("GPU was gone while iterating. Please reload the page."),s)),p.reset(),r},reset:()=>t({device:null})}}function q(e){return"device"in e&&"storageBuffers"in e}const G=M();export{y as H,q as a,G as g,c as h,p as i,z as s};
