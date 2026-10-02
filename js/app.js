$("#lbtn").onclick=login;$("#pw").onkeydown=e=>{if(e.key==="Enter")login()};
if(!CONFIG.API_URL){$("#prev").classList.remove("hide");$("#prev").onclick=()=>{S.preview=true;S.user={name:"Режим перегляду",role:"admin"};showApp()}}
else if(S.token)api("me").then(u=>{S.user=u;showApp()}).catch(()=>{});

["click","keydown","pointermove"].forEach(ev=>document.addEventListener(ev,()=>{S.act=true},{passive:true}));
