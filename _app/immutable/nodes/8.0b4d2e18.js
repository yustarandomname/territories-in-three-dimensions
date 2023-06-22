import{S as H,i as L,s as $,k as S,l as D,m as C,h as m,n as w,b as h,G as A,H as E,I as P,$ as x,w as Q,y as V,a as N,z as I,c as q,p as B,A as O,g as _,d as g,f as R,R as ee,B as j,_ as te,q as W,r as X,e as T,v as U,T as re}from"../chunks/index.2ecf17a4.js";import{s as M,f as ne}from"../chunks/settingStore.5e552471.js";import{C as Z}from"../chunks/auto.8ccec0e5.js";import{B as Y}from"../chunks/Button.14bf8c2c.js";function se(s){let r,t;return{c(){r=S("div"),t=S("canvas"),this.h()},l(e){r=D(e,"DIV",{class:!0});var n=C(r);t=D(n,"CANVAS",{id:!0}),C(t).forEach(m),n.forEach(m),this.h()},h(){w(t,"id",s[0]),w(r,"class","h-64 w64 flex justify-center mt-12")},m(e,n){h(e,r,n),A(r,t),s[5](t)},p(e,[n]){n&1&&w(t,"id",e[0])},i:E,o:E,d(e){e&&m(r),s[5](null)}}}function ae(s,r,t){let e,n,a;P(s,M,o=>t(4,a=o));let{nodes:l}=r,{id:p}=r,f,u=null;function b(){return{labels:l.map((o,d)=>d),datasets:[{label:"Density of red agents",borderColor:"rgba(255,99,132,1)",data:e},{label:"Density of blue agents",borderColor:"rgba(54, 162, 235, 1)",data:n}]}}x(()=>{u&&u.destroy()});function v(o){Q[o?"unshift":"push"](()=>{f=o,t(1,f)})}return s.$$set=o=>{"nodes"in o&&t(2,l=o.nodes),"id"in o&&t(0,p=o.id)},s.$$.update=()=>{s.$$.dirty&20&&(e=l.map(o=>a.densityType=="relative"?o.red_agents/(o.red_agents+o.blue_agents):o.red_agents)),s.$$.dirty&20&&(n=l.map(o=>a.densityType=="relative"?o.blue_agents/(o.red_agents+o.blue_agents):o.blue_agents)),s.$$.dirty&30&&f&&l&&a.densityType&&(u&&u.destroy(),t(3,u=new Z(f,{type:"line",data:b(),options:{animation:{duration:0}}})))},[p,f,l,u,a,v]}class oe extends H{constructor(r){super(),L(this,r,ae,se,$,{nodes:2,id:0})}}function le(s){let r,t;return{c(){r=S("div"),t=S("canvas"),this.h()},l(e){r=D(e,"DIV",{class:!0});var n=C(r);t=D(n,"CANVAS",{id:!0}),C(t).forEach(m),n.forEach(m),this.h()},h(){w(t,"id",s[0]),w(r,"class","h-64 w-[35rem] flex justify-center mt-12")},m(e,n){h(e,r,n),A(r,t),s[4](t)},p(e,[n]){n&1&&w(t,"id",e[0])},i:E,o:E,d(e){e&&m(r),s[4](null)}}}function ie(s,r,t){let e;P(s,M,u=>t(3,e=u));let{orderParams:n}=r,{id:a}=r,l;function p(u,b){const v={labels:b.map(({iter:o,result:d})=>o),datasets:[{label:`Order parameter over time (${e.orderScale} plot)`,borderColor:"rgba(255,99,132,1)",data:b.map(({iter:o,result:d})=>d)}]};new Z(u,{type:"line",data:v,options:{scales:{x:{type:e.orderScale,position:"bottom"}}}})}function f(u){Q[u?"unshift":"push"](()=>{l=u,t(1,l)})}return s.$$set=u=>{"orderParams"in u&&t(2,n=u.orderParams),"id"in u&&t(0,a=u.id)},s.$$.update=()=>{s.$$.dirty&14&&l&&n&&e&&p(l,n)},[a,l,n,e,f]}class ce extends H{constructor(r){super(),L(this,r,ie,le,$,{orderParams:2,id:0})}}function ue(s){const r=[Object.keys(s[0]).toString()],t=s.map(e=>Object.values(e).toString());return r.concat(t).join(`
`)}function de(s,r){const t=ue(s);let e=document.createElement("a");e.download=r.toString()+".csv",e.href=URL.createObjectURL(new Blob([t])),e.click(),e.remove()}function fe(s){let r;return{c(){r=W("Order csv")},l(t){r=X(t,"Order csv")},m(t,e){h(t,r,e)},d(t){t&&m(r)}}}function me(s){let r;return{c(){r=W("Download image")},l(t){r=X(t,"Download image")},m(t,e){h(t,r,e)},d(t){t&&m(r)}}}function G(s){let r=s[2]||s[3].orderScale,t,e,n=J(s);return{c(){n.c(),t=T()},l(a){n.l(a),t=T()},m(a,l){n.m(a,l),h(a,t,l),e=!0},p(a,l){l&12&&$(r,r=a[2]||a[3].orderScale)?(U(),g(n,1,1,E),R(),n=J(a),n.c(),_(n,1),n.m(t.parentNode,t)):n.p(a,l)},i(a){e||(_(n),e=!0)},o(a){g(n),e=!1},d(a){a&&m(t),n.d(a)}}}function J(s){let r,t;return r=new ce({props:{id:"orderChart",orderParams:s[1]}}),{c(){V(r.$$.fragment)},l(e){I(r.$$.fragment,e)},m(e,n){O(r,e,n),t=!0},p(e,n){const a={};n&2&&(a.orderParams=e[1]),r.$set(a)},i(e){t||(_(r.$$.fragment,e),t=!0)},o(e){g(r.$$.fragment,e),t=!1},d(e){j(r,e)}}}function F(s){let r=s[2],t,e,n=K(s);return{c(){n.c(),t=T()},l(a){n.l(a),t=T()},m(a,l){n.m(a,l),h(a,t,l),e=!0},p(a,l){l&4&&$(r,r=a[2])?(U(),g(n,1,1,E),R(),n=K(a),n.c(),_(n,1),n.m(t.parentNode,t)):n.p(a,l)},i(a){e||(_(n),e=!0)},o(a){g(n),e=!1},d(a){a&&m(t),n.d(a)}}}function K(s){let r,t;return r=new oe({props:{id:"densityChart",nodes:s[2].nodes.slice(s[4]*(s[0].size*s[0].size),s[4]*(s[0].size*s[0].size)+s[0].size)}}),{c(){V(r.$$.fragment)},l(e){I(r.$$.fragment,e)},m(e,n){O(r,e,n),t=!0},p(e,n){const a={};n&21&&(a.nodes=e[2].nodes.slice(e[4]*(e[0].size*e[0].size),e[4]*(e[0].size*e[0].size)+e[0].size)),r.$set(a)},i(e){t||(_(r.$$.fragment,e),t=!0)},o(e){g(r.$$.fragment,e),t=!1},d(e){j(r,e)}}}function _e(s){let r,t,e,n,a,l,p,f,u,b,v;t=new Y({props:{dark:!0,$$slots:{default:[fe]},$$scope:{ctx:s}}}),t.$on("click",s[10]),n=new Y({props:{dark:!0,$$slots:{default:[me]},$$scope:{ctx:s}}}),n.$on("click",s[9]);let o=s[2]?.nodes&&G(s),d=s[2]?.nodes&&F(s);return{c(){r=S("div"),V(t.$$.fragment),e=N(),V(n.$$.fragment),a=N(),l=S("div"),o&&o.c(),p=N(),f=S("div"),u=S("div"),d&&d.c(),this.h()},l(c){r=D(c,"DIV",{class:!0});var i=C(r);I(t.$$.fragment,i),e=q(i),I(n.$$.fragment,i),i.forEach(m),a=q(c),l=D(c,"DIV",{style:!0,class:!0});var y=C(l);o&&o.l(y),y.forEach(m),p=q(c),f=D(c,"DIV",{style:!0,class:!0});var k=C(f);u=D(k,"DIV",{class:!0});var z=C(u);d&&d.l(z),z.forEach(m),k.forEach(m),this.h()},h(){w(r,"class","absolute top-2 right-2 m-4 flex gap-4"),B(l,"min-width","30rem"),w(l,"class","h-[30rem] w-[40rem] p-8 flex items-center"),w(u,"class","sidePanel bg-gray-300/80 backdrop:blur-xl h-[20rem] rounded-xl p-8 flex items-center svelte-1tggtc6"),B(f,"perspective","20rem"),B(f,"left","calc(100% - 3rem)"),w(f,"class","absolute -top-44")},m(c,i){h(c,r,i),O(t,r,null),A(r,e),O(n,r,null),h(c,a,i),h(c,l,i),o&&o.m(l,null),h(c,p,i),h(c,f,i),A(f,u),d&&d.m(u,null),v=!0},p(c,[i]){const y={};i&4096&&(y.$$scope={dirty:i,ctx:c}),t.$set(y);const k={};i&4096&&(k.$$scope={dirty:i,ctx:c}),n.$set(k),c[2]?.nodes?o?(o.p(c,i),i&4&&_(o,1)):(o=G(c),o.c(),_(o,1),o.m(l,null)):o&&(U(),g(o,1,1,()=>{o=null}),R()),c[2]?.nodes?d?(d.p(c,i),i&4&&_(d,1)):(d=F(c),d.c(),_(d,1),d.m(u,null)):d&&(U(),g(d,1,1,()=>{d=null}),R())},i(c){v||(_(t.$$.fragment,c),_(n.$$.fragment,c),_(o),_(d),b||ee(()=>{b=re(f,ne,{x:160,y:-150,duration:800}),b.start()}),v=!0)},o(c){g(t.$$.fragment,c),g(n.$$.fragment,c),g(o),g(d),v=!1},d(c){c&&m(r),j(t),j(n),c&&m(a),c&&m(l),o&&o.d(),c&&m(p),c&&m(f),d&&d.d()}}}function pe(s,r,t){let e,n,a,l,p;P(s,M,i=>t(3,l=i));const{outputUniverse:f,HYPERPARAMS:u,sliceIndex:b,orderParams:v}=te("layoutData");P(s,f,i=>t(2,a=i)),P(s,u,i=>t(0,e=i)),P(s,b,i=>t(4,p=i)),P(s,v,i=>t(1,n=i));function o(i){let y=i.toDataURL("image/webp",.5);const k=document.createElement("a");k.href=y;const z=JSON.stringify(e);k.download=z+"-"+i.id+".webp",k.click(),k.remove()}function d(){const i=document.querySelector("#densityChart"),y=document.querySelector("#orderChart");!i||!y||(o(i),o(y))}function c(){de(n,e)}return[e,n,a,l,p,f,u,b,v,d,c]}class ye extends H{constructor(r){super(),L(this,r,pe,_e,$,{})}}export{ye as component};
