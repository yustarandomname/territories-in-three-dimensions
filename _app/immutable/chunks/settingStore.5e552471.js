import{ad as $,ae as M,a2 as w,ac as j}from"./index.2ecf17a4.js";import{w as q}from"./index.0449cfc6.js";function k(t){const n=t-1;return n*n*n+1}function U(t){return--t*t*t*t*t+1}function I(t,n){var r={};for(var e in t)Object.prototype.hasOwnProperty.call(t,e)&&n.indexOf(e)<0&&(r[e]=t[e]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var o=0,e=Object.getOwnPropertySymbols(t);o<e.length;o++)n.indexOf(e[o])<0&&Object.prototype.propertyIsEnumerable.call(t,e[o])&&(r[e[o]]=t[e[o]]);return r}function V(t,{delay:n=0,duration:r=400,easing:e=M}={}){const o=+getComputedStyle(t).opacity;return{delay:n,duration:r,easing:e,css:a=>`opacity: ${a*o}`}}function A(t,{delay:n=0,duration:r=400,easing:e=k,x:o=0,y:a=0,opacity:S=0}={}){const i=getComputedStyle(t),c=+i.opacity,p=i.transform==="none"?"":i.transform,l=c*(1-S),[s,g]=$(o),[f,y]=$(a);return{delay:n,duration:r,easing:e,css:(d,m)=>`
			transform: ${p} translate(${(1-d)*s}${g}, ${(1-d)*f}${y});
			opacity: ${c-l*m}`}}function E(t){var{fallback:n}=t,r=I(t,["fallback"]);const e=new Map,o=new Map;function a(i,c,p){const{delay:l=0,duration:s=u=>Math.sqrt(u)*30,easing:g=k}=w(w({},r),p),f=i.getBoundingClientRect(),y=c.getBoundingClientRect(),d=f.left-y.left,m=f.top-y.top,x=f.width/y.width,_=f.height/y.height,v=Math.sqrt(d*d+m*m),b=getComputedStyle(c),P=b.transform==="none"?"":b.transform,C=+b.opacity;return{delay:l,duration:j(s)?s(v):s,easing:g,css:(u,O)=>`
				opacity: ${u*C};
				transform-origin: top left;
				transform: ${P} translate(${O*d}px,${O*m}px) scale(${u+(1-u)*x}, ${u+(1-u)*_});
			`}}function S(i,c,p){return(l,s)=>(i.set(s.key,l),()=>{if(c.has(s.key)){const g=c.get(s.key);return c.delete(s.key),a(g,l,s)}return i.delete(s.key),n&&n(l,s,p)})}return[S(o,e,!1),S(e,o,!0)]}let B=[{id:"1",steps:1,amount:25},{id:"10",steps:10,amount:10},{id:"100",steps:100,amount:10},{id:"400",steps:400,amount:3},{id:"1000",steps:1e3,amount:2}],h={darkMode:"auto",orderScale:"logarithmic",densityType:"absolute",autoPlaySteps:B,autoPlayBetas:[1e-5]};function J(){const{subscribe:t,set:n,update:r}=q(h);return{subscribe:t,setup:()=>{let e=localStorage?.getItem("settings");e&&n({...h,...JSON.parse(e)})},set:(e,o)=>{r(a=>(a[e]=o,localStorage?.setItem("settings",JSON.stringify(a)),a))},reset:()=>{n(h),localStorage?.removeItem("settings")}}}const T=J();export{V as a,E as c,A as f,U as q,T as s};