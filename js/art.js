/* векторні ілюстрації, плаваючі декорації та частинки фону */
const ART={
bandage:'<rect x="5" y="22" width="54" height="20" rx="10"/><path d="M26 22v20M38 22v20M14 32h.1M50 32h.1"/>',
flask:'<path d="M26 8h12M28 8v18L11 54a4 4 0 0 0 4 6h34a4 4 0 0 0 4-6L36 26V8"/><path d="M17 42h30M26 50h.1M36 47h.1"/>',
cross:'<path d="M26 10h12v16h16v12H38v16H26V38H10V26h16z"/>',
drop:'<path d="M32 7C32 7 13 30 13 42a19 19 0 0 0 38 0C51 30 32 7 32 7z"/><path d="M22 44a10 10 0 0 0 8 9"/>',
mortar:'<path d="M9 30h46c0 15-9 25-23 25S9 45 9 30z"/><path d="M38 28L53 7M20 55h24"/>',
sprig:'<path d="M32 59V13"/><path d="M32 45c-11 0-17-6-19-15 11 0 17 5 19 15zM32 33c11 0 17-6 19-15-11 0-17 5-19 15zM32 21c-6 0-10-4-12-10 7 0 11 3 12 10z"/>',
pill:'<rect x="6" y="22" width="52" height="20" rx="10" transform="rotate(-35 32 32)"/><path d="M24 18l16 28"/>',
leaf:'<path d="M10 54C10 28 28 10 54 10c0 26-18 44-44 44z"/><path d="M10 54L38 26"/>'
};
const CAT_ART=["bandage","flask","cross","drop","mortar","sprig","pill","leaf"],HUE=[172,200,350,140,32,95,280,125];
const svg=n=>`<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ART[n]}</svg>`;
const ph=r=>`<div class="ph" style="--h:${HUE[r.cat]}">${svg(CAT_ART[r.cat])}<img loading="lazy" alt="" src="assets/images/cat${r.cat}.jpg" onerror="this.remove()"></div>`;
function celebrate(name){
  const c=document.createElement("div");c.className="celeb";
  let s="";for(let i=0;i<22;i++){const a=Math.random()*6.28,d=90+Math.random()*160;s+=`<i style="--x:${Math.cos(a)*d}px;--y:${Math.sin(a)*d}px;animation-delay:${Math.random()*.3}s"></i>`}
  c.innerHTML=`<div style="display:grid;place-items:center"><div class="fl">${svg("flask")}</div><h2>Готово: ${esc(name)}</h2>${s}</div>`;
  document.body.append(c);setTimeout(()=>c.remove(),2300);
}
(function(){
  const reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
  const d=document.createElement("div");d.id="decor";const k=Object.keys(ART);
  for(let i=0;i<16;i++){const e=document.createElement("div"),sz=28+Math.random()*60;
    e.className="dc";e.style.cssText=`left:${Math.random()*96}%;top:${Math.random()*92}%;width:${sz}px;height:${sz}px;opacity:${.07+Math.random()*.13};--d:${9+Math.random()*10}s;--l:-${Math.random()*12}s;--r0:${Math.random()*60-30}deg;${i%3?"":"filter:blur(1.5px)"}`;
    e.innerHTML=svg(k[i%k.length]);d.append(e)}
  document.body.prepend(d);
  const lg=document.getElementById("lgo");if(lg)lg.innerHTML=svg("flask");
  const nb=document.querySelector("nav .brand");if(nb)nb.innerHTML=svg("cross")+"Аптека Аннесбурга";
  if(reduce)return;
  const cv=document.createElement("canvas");cv.id="fx";document.body.prepend(cv);const x=cv.getContext("2d");let W,H,P=[];
  const rs=()=>{W=cv.width=innerWidth;H=cv.height=innerHeight};rs();addEventListener("resize",rs);
  for(let i=0;i<46;i++)P.push({x:Math.random()*W,y:Math.random()*H,r:1+Math.random()*2.4,v:.15+Math.random()*.4,a:Math.random()*6.28,o:.15+Math.random()*.4});
  (function f(){if(!document.hidden){x.clearRect(0,0,W,H);P.forEach(p=>{p.y-=p.v;p.a+=.01;p.x+=Math.sin(p.a)*.35;if(p.y<-10){p.y=H+10;p.x=Math.random()*W}
    const g=x.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*4);g.addColorStop(0,`rgba(90,240,210,${p.o})`);g.addColorStop(1,"rgba(90,240,210,0)");x.fillStyle=g;x.beginPath();x.arc(p.x,p.y,p.r*4,0,6.28);x.fill()})}requestAnimationFrame(f)})();
})();
