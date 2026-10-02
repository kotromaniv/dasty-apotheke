/* власна генеративна ембієнт-музика (Web Audio): без аудіофайлів, без авторських прав */
const AU={on:false,vol:.3,sfx:true};
try{Object.assign(AU,JSON.parse(localStorage.getItem("au")||"{}"))}catch(e){}
let actx=null,mus=null;
const auSave=()=>{try{localStorage.setItem("au",JSON.stringify(AU))}catch(e){}};
function music(){
  if(!AU.on){if(mus){clearInterval(mus.t);mus.g.gain.setTargetAtTime(0,actx.currentTime,.4);mus=null}syncBtn();return}
  if(mus){mus.g.gain.value=AU.vol*.25;return}
  actx=actx||new AudioContext();actx.resume();
  const g=actx.createGain();g.gain.value=AU.vol*.25;g.connect(actx.destination);
  const ch=[[220,261.6,329.6],[174.6,220,261.6],[196,246.9,293.7],[164.8,196,246.9]];let i=0;
  const note=(f,d,v,at=0)=>{const o=actx.createOscillator(),e=actx.createGain(),t=actx.currentTime+at;o.type="sine";o.frequency.value=f;e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v,t+d*.4);e.gain.linearRampToValueAtTime(0,t+d);o.connect(e);e.connect(g);o.start(t);o.stop(t+d)};
  const bar=()=>{const c=ch[i++%4];c.forEach(f=>{note(f,9,.3);note(f/2,9,.18)});for(let k=0;k<4;k++)note(c[Math.floor(Math.random()*3)]*2,3,.1,k*2+Math.random())};
  bar();mus={g,t:setInterval(bar,8000)};syncBtn();
}
function sfx(t){if(!AU.sfx)return;try{actx=actx||new AudioContext();const o=actx.createOscillator(),g=actx.createGain(),n=actx.currentTime;o.type="triangle";o.frequency.setValueAtTime(t==="er"?200:440,n);if(t==="done"){o.frequency.linearRampToValueAtTime(880,n+.25)}g.gain.setValueAtTime(Math.min(.06,AU.vol/5),n);g.gain.exponentialRampToValueAtTime(.001,n+.3);o.connect(g);g.connect(actx.destination);o.start();o.stop(n+.3)}catch(e){}}
function syncBtn(){const b=document.getElementById("mt");if(b)b.textContent=AU.on?"🎵":"🔇"}
(function(){const b=document.createElement("button");b.id="mt";b.title="Музика";b.onclick=()=>{AU.on=!AU.on;auSave();music()};document.body.append(b);syncBtn();
  document.addEventListener("click",()=>{if(AU.on&&!mus)music()},{once:true})})();
const _toast=toast;toast=(m,t)=>{_toast(m,t);sfx(t==="er"?"er":"ok")};
