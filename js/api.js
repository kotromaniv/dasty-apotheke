/* ===== CONFIG ===== */
const CONFIG={API_URL:"https://script.google.com/macros/s/AKfycbzLoRlej95uYgcSPml9MvCnzGBe1GxalEy7VsGwE8_vEfUVnRw8xROJ3efg0a7MilSk8w/exec",POLL_MS:3000,CAPACITY:3500};

/* ===== api.js ===== */
const S={user:null,token:null,inv:{},prices:{},preview:false};
try{S.token=sessionStorage.getItem("tk")}catch(e){}
async function api(action,data={}){
  if(!CONFIG.API_URL)throw new Error("Сервер не підключено (CONFIG.API_URL порожній)");
  const r=await fetch(CONFIG.API_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},
    body:JSON.stringify({action,token:S.token,requestId:crypto.randomUUID(),data})});
  const j=await r.json();
  if(!j.ok){if(j.code==="SESSION_ENDED")return endSession(j.message);throw new Error(j.error||"Помилка сервера")}
  return j.data;
}
