/* ===== авторизація та сесія ===== */
async function showApp(){await loadRef();$("#login").classList.add("hide");$("#app").classList.remove("hide");buildNav();go(location.hash.slice(1)||"home");startPoll()}
function endSession(msg){
  S.user=null;S.token=null;try{sessionStorage.removeItem("tk")}catch(e){}
  clearInterval(S.poll);$("#app").classList.add("hide");$("#login").classList.remove("hide");
  $("#lerr").textContent=msg||"Сесію завершено. Потрібно перепідключитися. Всі підтверджені дії збережені.";
}
function startPoll(){clearInterval(S.poll);if(!CONFIG.API_URL||S.preview)return;S.poll=setInterval(()=>{const a=S.act;S.act=false;api("ping",{active:a}).then(r=>{if(r&&r.idleIn!=null){if(r.idleIn<60&&!S.warned){S.warned=1;toast("Сесія завершиться через "+r.idleIn+" с без активності","er")}else if(r.idleIn>=60)S.warned=0}}).catch(()=>{})},CONFIG.POLL_MS)}
async function login(){
  const b=$("#lbtn");$("#lerr").textContent="";
  if(!$("#lg").value||!$("#pw").value){$("#lerr").textContent="Введіть логін і пароль";return}
  b.disabled=true;b.innerHTML='<span class="spin"></span>Вхід…';
  try{const d=await api("login",{login:$("#lg").value,password:$("#pw").value});
    S.token=d.token;S.user=d.user;try{sessionStorage.setItem("tk",d.token)}catch(e){}$("#pw").value="";showApp()}
  catch(e){$("#lerr").textContent=e.message}
  b.disabled=false;b.textContent="Увійти";
}
