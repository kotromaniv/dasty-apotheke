/* ===== Аптека Аннесбурга — серверна частина (Google Apps Script) =====
   Скрипт має бути прив'язаний до таблиці (Розширення → Apps Script).
   Секрети (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID) — лише в Властивостях скрипта. */
const TZ="Europe/Kyiv",ROUNDS=200,RAW="Сировина";
const CATS=["Перев'язки","Тоніки та настої","Реанімаційні засоби","Настоянки","Мазі","Ветеринарія","Рецептурні препарати","Інгредієнти"];
const SH={
Users:["id","name","login","hash","role","perms","skill","status","created","lastLogin","notes"],
Sessions:["id","userId","tokenHash","created","last","status","reason"],
Items:["id","name","category","unit","min","note","active"],
Inventory:["itemId","qty","updated"],
Recipes:["id","name","cat","skill","time","yield","status","enabled","version","updated"],
RecipeIngredients:["recipeId","item","qty"],
CraftHistory:["id","time","userId","user","recipeId","recipe","version","cycles","used","produced","started","finished","status","snapshot"],
InventoryHistory:["id","time","user","itemId","item","delta","before","after","reason","ref"],
Products:["id","name","category","qty","price","status","created","by","note","sold"],
SalesHistory:["id","time","user","productId","name","qty","price","total"],
WholesaleOrders:["id","title","party","due","status","created","by","comment"],
WholesaleOrderItems:["orderId","item","qty","price","done"],
MarketPrices:["item","price","updated","note","by"],
Alerts:["id","item","condition","message","interval","repeats","chatId","start","status","sent","nextAt","lastError","by"],
AlertHistory:["id","time","alertId","item","n","status","error"],
ActivityLog:["id","time","user","type","desc","before","after","status","entity"],
SiteSettings:["key","value"],
MaintenanceSchedule:["id","type","when","daily","scenario","reason","message","status","lastRun"],
Reservations:["id","productId","item","qty","status"]
};
/* початкові рецепти з ТЗ: [категорія, назва, вміння, час, вихід, інгредієнти|null=недоступний] */
const SEED=[
[0,"Бинт",1,15,5,{"Вовна":2,"Волокна":15}],[0,"Стерильний бинт",1,20,5,{"Вовна":5,"Флакон спирту":5}],
[1,"Відвар кори дуба",2,30,3,{"Коркова кора":4,"Деревний сік":10,"Порожній флакон":3}],
[1,"Бадьорящий тонік",2,30,3,{"Тонізуючий збір":1,"Кавові зерна":5,"Порожній флакон":3}],
[1,"Лікувальний настій",3,40,4,{"Цілющий збір":2,"Мед":5,"Порожній флакон":4}],
[2,"Нашатирний спирт",3,40,4,{"Тонізуючий збір":1,"Витяжка з печінки":1,"Флакон спирту":4}],
[2,"Протиотрута",3,50,3,{"Заспокійливий збір":1,"Витяжка з отрути":1,"Флакон спирту":3}],
[2,"Реанімаційний шприц",1,0,0,null],
[3,"Зміцнююча мікстура",3,45,2,{"Відновлюючий збір":1,"Деревний сік":5,"Порожній флакон":2}],
[3,"Загоюючий напій",3,45,2,{"Цілющий збір":1,"Мед":7,"Порожній флакон":2}],
[3,"Відновлююча емульсія",3,45,2,{"Тонізуючий збір":1,"Смола":5,"Порожній флакон":2}],
[3,"Репаративна суспензія",3,45,2,{"Відновлюючий збір":1,"Баран-голова":6,"Порожній флакон":2}],
[3,"Стабілізаційний розчин",3,45,2,{"Заспокійливий збір":1,"Сірка":2,"Порожній флакон":2}],
[4,"Зігріваюча мазь",1,20,3,{"Мед":2,"Перець чилі":2,"Каучук":2,"Свиняче сало":5}],
[5,"Ліки для бджіл",2,30,5,{"Заспокійливий збір":1,"Мед":2,"Деревний сік":5}],
[5,"Ліки для собаки",2,30,3,{"Заспокійливий збір":1,"Свиняче сало":5,"Порожній шприц":3}],
[5,"Ліки для коня",3,40,1,{"Цілющий збір":1,"Цукор":5,"Деревний сік":10}],
[6,"Кокаїнові жуйки",3,60,5,{"Екстракт коки":2,"Мед":8,"Каучук":5}],
[6,"Лаундаум",1,0,0,null],
[7,"Тонізуючий збір",1,20,1,{"Аляскинський женьшень":3,"Гіркий бур'ян":3,"Шавлія пустельна":3}],
[7,"Цілющий збір",1,20,1,{"Дикий білоцвіт":3,"Гаультерія":3,"Американський женьшень":3}],
[7,"Заспокійливий збір",1,20,1,{"Кровоцвіт":3,"Корінь лопуха":3,"Ахілея":3}],
[7,"Відновлюючий збір",1,20,1,{"Деревій":3,"Молочай":3,"Мімоза соромлива":3}],
[7,"Флакон спирту",1,30,100,{"Порожній флакон":100,"Спирт":1}],
[7,"Витяжка з печінки",2,60,5,{"Печінка хижого звіра":5,"Сірка":5,"Порожній флакон":5}],
[7,"Концентрат макової рідини",3,80,3,{"Степовий мак":10,"Сірка":10,"Порожній флакон":3}],
[7,"Екстракт листя коки",3,80,3,{"Листя коки":15,"Сірка":10,"Порожній флакон":3}]
];

/* ---------- шар даних ---------- */
const C=CacheService.getScriptCache(),SC={};
const now=()=>Date.now(),fmt=t=>t?Utilities.formatDate(new Date(+t),TZ,"yyyy-MM-dd HH:mm:ss"):"—";
const uid=p=>p+Utilities.getUuid().replace(/-/g,"").slice(0,8);
const E=(m,c)=>{const e=new Error(m);e.code=c||"APP";return e};
const sheet=n=>SC[n]||(SC[n]=SpreadsheetApp.getActive().getSheetByName(n));
function all(n){const v=sheet(n).getDataRange().getValues(),h=v[0];return v.slice(1).map((r,i)=>{const o={_r:i+2};h.forEach((k,j)=>{let x=r[j];if(x instanceof Date)x=Utilities.formatDate(x,TZ,"yyyy-MM-dd");o[k]=x});return o})}
const rowOf=(n,o)=>SH[n].map(k=>o[k]??"");
const add=(n,o)=>sheet(n).appendRow(rowOf(n,o));
function addMany(n,a){if(!a.length)return;const s=sheet(n);s.getRange(s.getLastRow()+1,1,a.length,SH[n].length).setValues(a.map(o=>rowOf(n,o)))}
const upd=(n,o)=>sheet(n).getRange(o._r,1,1,SH[n].length).setValues([rowOf(n,o)]);
const withLock=f=>{const l=LockService.getScriptLock();l.waitLock(25000);try{return f()}finally{l.releaseLock()}};
const int=(x,m,M,n)=>{x=Number(x);if(!Number.isInteger(x)||x<m||x>M)throw E("Некоректне значення: "+n);return x};
const str=(x,n,max=200)=>{x=String(x??"").trim();if(!x||x.length>max)throw E("Некоректне поле: "+n);return x};
function cfg(){const c=C.get("cfg");if(c)return JSON.parse(c);const o={};all("SiteSettings").forEach(r=>o[r.key]=r.value);C.put("cfg",JSON.stringify(o),60);return o}
function setCfg(o){const rows=all("SiteSettings");Object.keys(o).forEach(k=>{const r=rows.find(x=>x.key===k);if(r){r.value=o[k];upd("SiteSettings",r)}else add("SiteSettings",{key:k,value:o[k]})});C.remove("cfg")}
function log(user,type,desc,before,after,status,entity){add("ActivityLog",{id:uid("L"),time:now(),user,type,desc,before:before===undefined?"":JSON.stringify(before),after:after===undefined?"":JSON.stringify(after),status:status||"ok",entity:entity||""})}
function logErr(e){try{log("system","error",String(e.message).slice(0,300),"","","error")}catch(x){}}

/* ---------- паролі та сесії ---------- */
const hex=b=>b.map(x=>("0"+(x&255).toString(16)).slice(-2)).join("");
const sha=s=>hex(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,s,Utilities.Charset.UTF_8));
function hashPw(pw,salt){let h=salt+pw;for(let i=0;i<ROUNDS;i++)h=sha(h+salt);return salt+"$"+h}
const verify=(pw,st)=>{const s=String(st||"").split("$")[0];return !!s&&hashPw(String(pw||""),s)===st};
const newHash=pw=>{if(String(pw).length<8)throw E("Пароль має містити щонайменше 8 символів");return hashPw(String(pw),Utilities.getUuid().slice(0,12))};
const thash=t=>"h:"+sha(String(t||""));
function sget(th){const c=C.get("s:"+th);if(c)return JSON.parse(c);const r=all("Sessions").find(x=>x.tokenHash===th);if(!r)return null;const o={id:r.id,uid:r.userId,st:r.status,reason:r.reason,last:+r.last};C.put("s:"+th,JSON.stringify(o),21600);return o}
const sput=(th,o)=>C.put("s:"+th,JSON.stringify(o),21600);
function endSession(th,s,reason){s.st="ended";s.reason=reason;sput(th,s);const r=all("Sessions").find(x=>x.tokenHash===th);if(r){r.status="ended";r.reason=reason;r.last=s.last;upd("Sessions",r)}}
function endWhere(pred,reason){const rows=all("Sessions").filter(r=>r.status==="active"&&pred(r)),put={};rows.forEach(r=>{const s=sget(r.tokenHash)||{uid:r.userId,last:+r.last};s.st="ended";s.reason=reason;put["s:"+r.tokenHash]=JSON.stringify(s);r.status="ended";r.reason=reason;upd("Sessions",r)});if(rows.length)C.putAll(put,21600);return rows.length}
function session(th){const s=sget(th);
  if(!s)throw E("Потрібно увійти.","SESSION_ENDED");
  if(s.st!=="active")throw E(s.reason||"Потрібно перепідключитися. Всі підтверджені дії збережені.","SESSION_ENDED");
  const i=+cfg().idleMinutes;if(i>0&&now()-s.last>i*60000){endSession(th,s,"Сесію завершено через бездіяльність.");throw E("Сесію завершено через бездіяльність.","SESSION_ENDED")}
  return s}
const pub=u=>({id:u.id,name:u.name,login:u.login,role:u.role,perms:u.perms,skill:+u.skill||1});
const can=(u,p)=>u.role==="admin"||(p!=="admin"&&String(u.perms||"").split(",").map(s=>s.trim()).includes(p));
function rate(id){const k="rl:"+id+":"+Math.floor(now()/60000),n=(+C.get(k)||0)+1;C.put(k,n,120);if(n>240)throw E("Забагато запитів. Зачекайте хвилину.")}
function login(d){
  const lg=String(d.login||"").trim().toLowerCase(),k="lf:"+lg,f=+C.get(k)||0;
  if(f>=5)throw E("Забагато спроб входу. Спробуйте за 5 хвилин.");
  const u=all("Users").find(x=>String(x.login).toLowerCase()===lg);
  if(!u||!verify(d.password,u.hash)){C.put(k,f+1,300);throw E("Невірний логін або пароль")}
  if(u.status!=="active")throw E("Акаунт заблоковано");
  if(u.role!=="admin"&&+cfg().maintUntil>now())throw E("Тривають технічні роботи. Спробуйте за хвилину.");
  C.remove(k);const token=Utilities.getUuid()+Utilities.getUuid(),th=thash(token),t=now();
  add("Sessions",{id:uid("S"),userId:u.id,tokenHash:th,created:t,last:t,status:"active",reason:""});
  sput(th,{uid:u.id,st:"active",last:t});u.lastLogin=t;upd("Users",u);
  log(u.name,"login","Вхід у систему");return{token,user:pub(u)}}

/* ---------- маршрутизація ---------- */
const READ=new Set(["me","snapshot","dashboard","inventory.list","inventory.history","products.list","orders.list","orders.get","alerts.list","alerts.history","log.list","profile.get","admin.users","admin.sessions","admin.recipes","admin.maintList","admin.settings","admin.export"]);
const PERM={craft:"craft","inventory.list":"stock","inventory.history":"stock","inventory.move":"stock_edit","inventory.addItem":"admin","products.list":"goods","products.save":"goods","products.status":"goods","orders.list":"orders","orders.get":"orders","orders.save":"orders","orders.status":"orders","orders.fulfil":"orders","prices.set":"prices"};
function doGet(){return out({ok:true,service:"annesburg",time:fmt(now())})}
const out=o=>ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
function doPost(e){let r;
  try{r={ok:true,data:route(JSON.parse(e.postData.contents))}}
  catch(x){r={ok:false,error:x.code?x.message:"Внутрішня помилка сервера",code:x.code==="SESSION_ENDED"?"SESSION_ENDED":"ERR",message:x.message};if(!x.code)logErr(x)}
  return out(r)}
function route(q){
  const a=String(q.action||""),d=q.data||{};
  if(a==="login")return withLock(()=>login(d));
  const th=thash(q.token),s=session(th);
  if(a==="ping"){if(d.active)s.last=now();sput(th,s);const i=+cfg().idleMinutes;return{idleIn:i>0?Math.max(0,Math.round((i*60000-(now()-s.last))/1000)):null}}
  s.last=now();sput(th,s);
  const u=all("Users").find(x=>x.id===s.uid);
  if(!u||u.status!=="active"){endSession(th,s,"Акаунт недоступний.");throw E("Акаунт недоступний.","SESSION_ENDED")}
  if(+cfg().maintUntil>now()&&u.role!=="admin")throw E("Тривають технічні роботи.","SESSION_ENDED");
  rate(u.id);const h=H[a];if(!h)throw E("Невідома дія: "+a);
  const p=/^(admin|alerts)\./.test(a)?"admin":PERM[a];if(p&&!can(u,p))throw E("Недостатньо прав");
  const ctx={u,s,th};if(READ.has(a))return h(ctx,d);
  const rk="rq:"+q.requestId;if(q.requestId){const c=C.get(rk);if(c)return JSON.parse(c)}
  const r=withLock(()=>h(ctx,d));if(q.requestId)C.put(rk,JSON.stringify(r===undefined?null:r),21600);return r}

/* ---------- склад ---------- */
function stock(){
  const inv={};all("Inventory").forEach(r=>inv[r.itemId]=r);
  const res={};all("Reservations").filter(r=>r.status==="active").forEach(r=>res[r.item]=(res[r.item]||0)+ +r.qty);
  const items=all("Items").filter(i=>i.active!==0).map(i=>{const v=inv[i.id]||{};return{id:i.id,name:i.name,category:i.category,unit:i.unit||"шт",min:+i.min||0,note:i.note,qty:+v.qty||0,updated:v.updated?fmt(v.updated):"—",reserved:res[i.name]||0}});
  return{items,total:items.reduce((a,i)=>a+i.qty,0)}}
function applyInv(ch,who,reason,ref){
  const m={};ch.forEach(c=>{m[c.id]?m[c.id].delta+=c.delta:m[c.id]={...c}});
  const s=sheet("Inventory"),v=s.getDataRange().getValues(),ix={};v.forEach((r,i)=>{if(i)ix[r[0]]=i});
  const t=now(),hist=[];
  Object.values(m).forEach(c=>{let i=ix[c.id];if(i===undefined){v.push([c.id,0,t]);i=v.length-1;ix[c.id]=i}
    const b=+v[i][1]||0,a=b+c.delta;if(a<0)throw E("Від'ємний залишок: "+c.name);v[i][1]=a;v[i][2]=t;
    hist.push({id:uid("H"),time:t,user:who,itemId:c.id,item:c.name,delta:c.delta,before:b,after:a,reason,ref:ref||""})});
  s.getRange(1,1,v.length,3).setValues(v);addMany("InventoryHistory",hist)}
function ensureItem(name,cat){const it=all("Items").find(i=>i.name===name);if(it)return it.id;const id=uid("I");add("Items",{id,name,category:cat,unit:"шт",min:0,note:"",active:1});add("Inventory",{itemId:id,qty:0,updated:now()});return id}
function recipes(){const ri={};all("RecipeIngredients").forEach(x=>(ri[x.recipeId]=ri[x.recipeId]||{})[x.item]=+x.qty);
  return all("Recipes").filter(r=>r.status!=="archived").map(r=>({id:r.id,name:r.name,cat:Math.max(0,CATS.indexOf(r.cat)),skill:+r.skill,time:+r.time,yield:+r.yield,na:r.status==="na",enabled:+r.enabled===1,ing:ri[r.id]||{},version:+r.version||1}))}
const setCell=(n,row,col,v)=>sheet(n).getRange(row,SH[n].indexOf(col)+1).setValue(v);

const H={
me:c=>pub(c.u),
snapshot(c){const st=stock(),inv={},pr={};st.items.forEach(i=>inv[i.name]=i.qty-i.reserved);all("MarketPrices").forEach(p=>pr[p.item]=+p.price);
  return{inv,prices:pr,total:st.total,capacity:+cfg().capacity,recipes:recipes().filter(r=>r.enabled||r.na)}},
dashboard(){const st=stock(),cf=cfg(),mm=all("MaintenanceSchedule").filter(x=>x.status==="scheduled");
  const msg=[cf.adminMessage,cf.maintenanceNotice,mm.length?"Найближчий рестарт: "+(mm[0].type==="daily"?"щодня о "+mm[0].daily:mm[0].when):""].filter(Boolean).join(" · ");
  return{positions:st.items.filter(i=>i.qty>0).length,totalUnits:st.total,capacity:+cf.capacity,
    products:st.items.filter(i=>i.category!==RAW&&i.category!==CATS[7]).reduce((s,i)=>s+i.qty,0),
    activeOrders:all("WholesaleOrders").filter(x=>["Очікує виконання","У процесі","Частково виконано"].includes(x.status)).length,
    activeAlerts:all("Alerts").filter(x=>x.status==="running").length,adminMessage:msg,
    recent:all("ActivityLog").slice(-8).reverse().map(r=>fmt(r.time)+" · "+r.user+" · "+r.desc)}},
"inventory.list":()=>{const st=stock();return{items:st.items,total:st.total,capacity:+cfg().capacity}},
"inventory.history":()=>all("InventoryHistory").slice(-100).reverse().map(r=>({time:fmt(r.time),user:r.user,item:r.item,delta:(r.delta>0?"+":"")+r.delta,reason:r.reason}))
,
"inventory.addItem"(c,d){const n=str(d.name,"назва");if(all("Items").some(i=>i.name===n))throw E("Предмет уже існує");
  const cat=str(d.category,"категорія"),id=uid("I");add("Items",{id,name:n,category:cat,unit:String(d.unit||"шт"),min:int(d.min||0,0,100000,"мін. залишок"),note:d.note||"",active:1});
  add("Inventory",{itemId:id,qty:0,updated:now()});log(c.u.name,"item","Новий предмет: "+n,"",{id,cat},"ok",id)},
"inventory.move"(c,d){
  const st=stock(),it=st.items.find(i=>i.id===d.itemId);if(!it)throw E("Предмет не знайдено");
  const q=int(d.qty,0,1000000,"кількість"),reason=String(d.reason||"").trim();
  let delta;
  if(d.type==="in"){if(q<1)throw E("Кількість має бути більшою за 0");delta=q}
  else if(d.type==="out"){if(q<1)throw E("Кількість має бути більшою за 0");if(!reason)throw E("Вкажіть причину");if(it.qty-it.reserved<q)throw E("Недостатньо вільного залишку");delta=-q}
  else if(d.type==="adjust"){if(!reason)throw E("Вкажіть причину коригування");delta=q-it.qty}
  else throw E("Невідомий тип операції");
  const cap=+cfg().capacity;if(st.total+delta>cap)throw E("Перевищено місткість складу ("+(st.total+delta)+" / "+cap+")");
  applyInv([{id:it.id,name:it.name,delta}],c.u.name,reason||"Надходження","manual");
  log(c.u.name,"stock",(delta>0?"+":"")+delta+" × "+it.name+(reason?" ("+reason+")":""),it.qty,it.qty+delta,"ok",it.id)},

craft(c,d){
  const rec=recipes().find(r=>r.id===d.recipeId);if(!rec)throw E("Рецепт не знайдено");
  if(rec.na||!rec.enabled)throw E("Рецепт наразі недоступний");
  const cy=int(d.cycles,1,1000,"кількість циклів");
  if((+c.u.skill||1)<rec.skill)throw E("Недостатній рівень уміння (потрібно "+rec.skill+")");
  const st=stock(),by={};st.items.forEach(i=>by[i.name]=i);
  const ch=[],miss=[];let used=0;
  Object.entries(rec.ing).forEach(([n,q])=>{const it=by[n];if(!it)throw E("Предмет «"+n+"» відсутній у довіднику");const need=q*cy,free=it.qty-it.reserved;used+=need;if(free<need)miss.push(n+" (бракує "+(need-free)+")");ch.push({id:it.id,name:n,delta:-need})});
  if(miss.length)throw E("Не вистачає: "+miss.join(", "));
  const o=by[rec.name];if(!o)throw E("Продукт відсутній у довіднику");const prod=rec.yield*cy;ch.push({id:o.id,name:rec.name,delta:prod});
  const fin=st.total-used+prod,cap=+cfg().capacity;
  if(fin>cap)throw E("Перевищено місткість складу: "+fin+" / "+cap);if(fin<0)throw E("Від'ємний залишок");
  const id=uid("C"),t=now();
  add("CraftHistory",{id,time:t,userId:c.u.id,user:c.u.name,recipeId:rec.id,recipe:rec.name,version:rec.version,cycles:cy,used:JSON.stringify(ch.filter(x=>x.delta<0).map(x=>[x.name,-x.delta])),produced:prod,started:t,finished:"",status:"started",snapshot:JSON.stringify(rec)});
  const row=sheet("CraftHistory").getLastRow();
  applyInv(ch,c.u.name,"Крафт: "+rec.name+" ×"+cy,id);
  setCell("CraftHistory",row,"finished",now());setCell("CraftHistory",row,"status","done");
  log(c.u.name,"craft",rec.name+" ×"+cy+" → +"+prod,"",{used,prod},"ok",id);return{id,produced:prod}},

"products.list":()=>{const res={};all("Reservations").filter(r=>r.status==="active").forEach(r=>res[r.productId]=(res[r.productId]||0)+ +r.qty);
  return all("Products").reverse().map(p=>({id:p.id,name:p.name,category:p.category,qty:p.qty,reserved:res[p.id]||0,price:p.price,status:p.status,by:p.by}))},
"products.save"(c,d){const st=stock(),it=st.items.find(i=>i.name===d.name);if(!it)throw E("Товар не знайдено на складі");
  const q=int(d.qty,1,100000,"кількість"),pr=Number(d.price);if(!(pr>=0))throw E("Некоректна ціна");
  if(it.qty-it.reserved<q)throw E("Недостатньо вільного залишку (доступно "+(it.qty-it.reserved)+")");
  const id=uid("P");add("Products",{id,name:it.name,category:it.category,qty:q,price:pr,status:"Активний продаж",created:now(),by:c.u.name,note:d.note||"",sold:0});
  add("Reservations",{id:uid("V"),productId:id,item:it.name,qty:q,status:"active"});log(c.u.name,"product","Пропозиція: "+it.name+" ×"+q+" по "+pr,"",{id},"ok",id)},
"products.status"(c,d){const p=all("Products").find(x=>x.id===d.id);if(!p)throw E("Пропозицію не знайдено");
  if(!["Активний продаж","Частково продано"].includes(p.status))throw E("Пропозиція вже закрита");
  const rs=all("Reservations").filter(r=>r.productId===p.id&&r.status==="active"),q=rs.reduce((a,r)=>a+ +r.qty,0);
  if(d.status==="sold"){const it=stock().items.find(i=>i.name===p.name);applyInv([{id:it.id,name:p.name,delta:-q}],c.u.name,"Продаж","sale:"+p.id);
    rs.forEach(r=>{r.status="consumed";upd("Reservations",r)});p.sold=+p.sold+q;p.qty=0;p.status="Продано";upd("Products",p);
    add("SalesHistory",{id:uid("Z"),time:now(),user:c.u.name,productId:p.id,name:p.name,qty:q,price:p.price,total:q*p.price})}
  else if(d.status==="off"){rs.forEach(r=>{r.status="released";upd("Reservations",r)});p.status="Знято з продажу";upd("Products",p)}
  else throw E("Невідомий статус");log(c.u.name,"product",p.name+" → "+p.status,"","","ok",p.id)},

"orders.list":()=>{const its=all("WholesaleOrderItems");return all("WholesaleOrders").reverse().map(o=>{const i=its.filter(x=>x.orderId===o.id),q=i.reduce((a,x)=>a+ +x.qty,0),dn=i.reduce((a,x)=>a+ +x.done,0);
  return{id:o.id,title:o.title,party:o.party,due:o.due,status:o.status,total:i.reduce((a,x)=>a+(x.price===""?0:x.qty*x.price),0),progress:(q?Math.round(dn/q*100):0)+"%"}})},
"orders.get"(c,d){const o=all("WholesaleOrders").find(x=>x.id===d.id);if(!o)throw E("Замовлення не знайдено");const st={};stock().items.forEach(i=>st[i.name]=i.qty-i.reserved);
  return{title:o.title,status:o.status,progress:"",items:all("WholesaleOrderItems").filter(x=>x.orderId===o.id).map(x=>({name:x.item,qty:x.qty,stock:st[x.item]||0,missing:Math.max(0,x.qty-x.done-(st[x.item]||0)),price:x.price===""?"Ціну не вказано":x.price})),
    history:all("ActivityLog").filter(l=>l.entity===o.id).map(l=>({time:fmt(l.time),user:l.user,text:l.desc}))}},
"orders.save"(c,d){const t=str(d.title,"назва"),names=new Set(all("Items").map(i=>i.name));if(!Array.isArray(d.items)||!d.items.length)throw E("Додайте позиції");
  const its=d.items.map(i=>{if(!names.has(i.name))throw E("Невідомий предмет: "+i.name);return{item:i.name,qty:int(i.qty,1,1000000,"кількість"),price:i.price==null||i.price===""?"":(Number(i.price)>=0?Number(i.price):(()=>{throw E("Некоректна ціна")})()),done:0}});
  const id=uid("O");add("WholesaleOrders",{id,title:t,party:String(d.party||""),due:d.due||"",status:"Очікує виконання",created:now(),by:c.u.name,comment:d.comment||""});
  addMany("WholesaleOrderItems",its.map(i=>({...i,orderId:id})));log(c.u.name,"order","Нове замовлення: "+t,"",{its},"ok",id)},
"orders.status"(c,d){const o=all("WholesaleOrders").find(x=>x.id===d.id);if(!o)throw E("Замовлення не знайдено");
  if(["Виконано","Скасовано"].includes(o.status))throw E("Замовлення вже закрите");if(d.status!=="Скасовано")throw E("Недопустимий статус");
  const old=o.status;o.status="Скасовано";upd("WholesaleOrders",o);log(c.u.name,"order",o.title+": "+old+" → Скасовано","","","ok",o.id)},
"orders.fulfil"(c,d){const o=all("WholesaleOrders").find(x=>x.id===d.id);if(!o)throw E("Замовлення не знайдено");
  if(["Виконано","Скасовано"].includes(o.status))throw E("Замовлення вже закрите");
  const its=all("WholesaleOrderItems").filter(x=>x.orderId===o.id),st=stock(),by={};st.items.forEach(i=>by[i.name]=i);
  const ch=[],give=[];its.forEach(x=>{const it=by[x.item],g=Math.min(Math.max(0,x.qty-x.done),it?it.qty-it.reserved:0);if(g>0){ch.push({id:it.id,name:x.item,delta:-g});give.push([x,g])}});
  if(!ch.length)throw E("На складі немає потрібних предметів");
  applyInv(ch,c.u.name,"Оптове замовлення: "+o.title,o.id);give.forEach(([x,g])=>{x.done=+x.done+g;upd("WholesaleOrderItems",x)});
  const full=its.every(x=>+x.done>=+x.qty);o.status=full?"Виконано":"Частково виконано";upd("WholesaleOrders",o);
  log(c.u.name,"order",o.title+" → "+o.status,"",give.map(([x,g])=>[x.item,g]),"ok",o.id)},

"prices.set"(c,d){const n=str(d.item,"предмет"),p=Number(d.price);if(!(p>=0))throw E("Некоректна ціна");
  const r=all("MarketPrices").find(x=>x.item===n),o={item:n,price:p,updated:now(),note:d.note||"",by:c.u.name};
  if(r){o._r=r._r;upd("MarketPrices",o)}else add("MarketPrices",o);log(c.u.name,"price",n+": "+p,r?r.price:"",p)},

"alerts.list":()=>all("Alerts").reverse().map(a=>({id:a.id,item:a.item,condition:{manual:"Ручний",min:"Мін. залишок",zero:"Відсутній"}[a.condition]||a.condition,interval:a.interval,sent:a.sent,repeats:a.repeats,status:a.status,lastError:a.lastError||"—"})),
"alerts.history":()=>all("AlertHistory").slice(-100).reverse().map(h=>({time:fmt(h.time),item:h.item,n:h.n,status:h.status,error:h.error||"—"})),
"alerts.save"(c,d){const it=str(d.item,"предмет");if(!all("Items").some(i=>i.name===it))throw E("Предмет не знайдено");
  const cond=["manual","min","zero"].includes(d.condition)?d.condition:null;if(!cond)throw E("Невідома умова");
  let st=cond==="manual"?"idle":"armed",nx=0;if(cond==="manual"&&d.start){nx=Utilities.parseDate(d.start,TZ,"yyyy-MM-dd'T'HH:mm").getTime();st="running"}
  add("Alerts",{id:uid("A"),item:it,condition:cond,message:String(d.message||"").slice(0,500),interval:int(d.interval,1,1440,"інтервал"),repeats:int(d.repeats,1,100,"кількість"),chatId:String(d.chatId||"").trim(),start:d.start||"",status:st,sent:0,nextAt:nx,lastError:"",by:c.u.name});
  log(c.u.name,"alert","Сповіщення: "+it)},
"alerts.action"(c,d){const a=all("Alerts").find(x=>x.id===d.id);if(!a)throw E("Сповіщення не знайдено");
  if(d.op==="del"){sheet("Alerts").deleteRow(a._r)}
  else{if(d.op==="stop")a.status="stopped";
    else if(d.op==="restart"){a.status="running";a.sent=0;a.nextAt=now();a.lastError=""}
    else if(d.op==="toggle")a.status=a.status==="disabled"?(a.condition==="manual"?"idle":"armed"):"disabled";
    else throw E("Невідома операція");upd("Alerts",a)}
  log(c.u.name,"alert",a.item+": "+d.op)},

"log.list"(c,d){const n=int(d.limit||200,1,500,"ліміт");let l=all("ActivityLog");if(c.u.role!=="admin")l=l.filter(x=>x.user===c.u.name);
  return l.slice(-n).reverse().map(r=>({time:fmt(r.time),user:r.user,type:r.type,desc:r.desc,status:r.status}))},
"profile.get"(c){const me=c.u.name;return{name:me,login:c.u.login,role:c.u.role==="admin"?"Адміністратор":"Співробітник",created:fmt(c.u.created),lastLogin:fmt(c.u.lastLogin),
  crafts:all("CraftHistory").filter(x=>x.userId===c.u.id&&x.status==="done").length,history:all("ActivityLog").filter(x=>x.user===me).slice(-30).reverse().map(x=>({time:fmt(x.time),type:x.type,desc:x.desc}))}},
"profile.password"(c,d){if(!verify(d.old,c.u.hash))throw E("Поточний пароль невірний");c.u.hash=newHash(d.pw);upd("Users",c.u);log(c.u.name,"auth","Зміна пароля")},

/* ---------- адміністрування ---------- */
"admin.users":()=>all("Users").map(u=>({id:u.id,name:u.name,login:u.login,role:u.role,status:u.status,lastLogin:fmt(u.lastLogin),skill:u.skill,perms:u.perms,notes:u.notes})),
"admin.userSave"(c,d){const role=d.role==="admin"?"admin":"employee",users=all("Users"),lg=str(d.login,"логін",40).toLowerCase();
  const o={name:str(d.name,"ім'я",60),login:lg,role,perms:String(d.perms||"stock,craft,goods,orders,prices"),skill:int(d.skill||1,1,10,"вміння"),notes:d.notes||""};
  if(d.id){const u=users.find(x=>x.id===d.id);if(!u)throw E("Користувача не знайдено");Object.assign(u,o);upd("Users",u)}
  else{if(users.some(x=>String(x.login).toLowerCase()===lg))throw E("Логін уже зайнятий");add("Users",{id:uid("U"),hash:newHash(d.password),status:"active",created:now(),lastLogin:"",...o})}
  log(c.u.name,"admin","Користувач: "+o.login)},
"admin.userReset"(c,d){const u=all("Users").find(x=>x.id===d.id);if(!u)throw E("Користувача не знайдено");u.hash=newHash(d.password);upd("Users",u);
  endWhere(r=>r.userId===u.id,"Пароль змінено адміністратором. Потрібно перепідключитися.");log(c.u.name,"admin","Скидання пароля: "+u.login)},
"admin.userStatus"(c,d){const u=all("Users").find(x=>x.id===d.id);if(!u)throw E("Користувача не знайдено");if(u.id===c.u.id)throw E("Не можна блокувати себе");
  u.status=d.status==="blocked"?"blocked":"active";upd("Users",u);if(u.status==="blocked")endWhere(r=>r.userId===u.id,"Акаунт заблоковано.");log(c.u.name,"admin",u.login+" → "+u.status)},
"admin.sessions":()=>{const us={};all("Users").forEach(u=>us[u.id]=u.name);return all("Sessions").filter(r=>r.status==="active").map(r=>{const s=sget(r.tokenHash)||{};return{id:r.id,user:us[r.userId]||r.userId,start:fmt(r.created),last:fmt(s.last||r.last)}})},
"admin.kick"(c,d){const m="Сесію завершено адміністратором. Потрібно перепідключитися. Всі підтверджені дії збережені.";let n;
  if(d.all)n=endWhere(r=>r.tokenHash!==c.th,m);else if(d.userId)n=endWhere(r=>r.userId===d.userId,m);else if(d.sessionId)n=endWhere(r=>r.id===d.sessionId,d.full?"Потрібен повний повторний вхід.":m);else throw E("Не вказано ціль");
  log(c.u.name,"kick","Завершено сесій: "+n)},
"admin.recipes":()=>all("Recipes").map(r=>r.id).length?recipes():[],
"admin.recipeSave"(c,d){const name=str(d.name,"назва",80),cat=int(d.cat,0,CATS.length-1,"категорія"),sk=int(d.skill,1,10,"вміння"),tm=int(d.time,1,3600,"час"),y=int(d.yield,1,100000,"вихід");
  const ing=d.ing||{};if(!Object.keys(ing).length)throw E("Додайте інгредієнти");Object.keys(ing).forEach(k=>int(ing[k],1,100000,"кількість "+k));
  const ex=d.id?all("Recipes").find(r=>r.id===d.id):null,id=ex?ex.id:uid("R"),before=ex?recipes().find(r=>r.id===id):"";
  const o={id,name,cat:CATS[cat],skill:sk,time:tm,yield:y,status:"active",enabled:d.enabled==="0"||d.enabled===0?0:1,version:ex?+ex.version+1:1,updated:now()};
  if(ex){o._r=ex._r;upd("Recipes",o);all("RecipeIngredients").filter(x=>x.recipeId===id).reverse().forEach(x=>sheet("RecipeIngredients").deleteRow(x._r))}else add("Recipes",o);
  ensureItem(name,CATS[cat]);Object.keys(ing).forEach(k=>ensureItem(k,RAW));addMany("RecipeIngredients",Object.entries(ing).map(([item,qty])=>({recipeId:id,item,qty})));
  log(c.u.name,"recipe",(ex?"Зміна":"Новий")+" рецепт: "+name+" v"+o.version,before,{...o,ing},"ok",id)},
"admin.recipeArchive"(c,d){const r=all("Recipes").find(x=>x.id===d.id);if(!r)throw E("Рецепт не знайдено");r.status="archived";upd("Recipes",r);log(c.u.name,"recipe","Архів: "+r.name)},
"admin.maintList":()=>all("MaintenanceSchedule").slice(-50).reverse().map(m=>({id:m.id,when:m.type==="daily"?"щодня о "+m.daily:m.when,type:{now:"Негайно",once:"Одноразово",daily:"Щодня"}[m.type],reason:m.reason,status:m.status})),
"admin.maintenance"(c,d){const t=["now","once","daily"].includes(d.type)?d.type:null;if(!t)throw E("Невідомий тип");
  const m={id:uid("M"),type:t,when:"",daily:"",scenario:d.scenario==="reconnect"?"reconnect":"logout",reason:String(d.reason||""),message:String(d.message||"").trim()||"Потрібно перепідключитися. Всі підтверджені дії збережені.",status:"scheduled",lastRun:""};
  if(t==="once"){if(!d.when)throw E("Вкажіть дату й час");m.when=d.when.replace("T"," ");Utilities.parseDate(d.when,TZ,"yyyy-MM-dd'T'HH:mm")}
  if(t==="daily"){if(!/^\d{2}:\d{2}$/.test(d.daily||""))throw E("Час у форматі ГГ:ХХ");m.daily=d.daily}
  if(t==="now"){m.status="done";add("MaintenanceSchedule",m);runMaint(m)}else add("MaintenanceSchedule",m);log(c.u.name,"restart",t+": "+m.reason)},
"admin.maintCancel"(c,d){const m=all("MaintenanceSchedule").find(x=>x.id===d.id);if(!m)throw E("Не знайдено");m.status="cancelled";upd("MaintenanceSchedule",m);log(c.u.name,"restart","Скасовано "+m.id)},
"admin.settings":()=>{const o={...cfg()};return o},
"admin.settingsSave"(c,d){const o={};
  if(d.idleMinutes!==undefined)o.idleMinutes=int(d.idleMinutes,0,1440,"бездіяльність");
  if(d.capacity!==undefined){o.capacity=int(d.capacity,1,1000000,"ліміт");if(o.capacity<stock().total)throw E("Ліміт менший за поточну кількість на складі")}
  ["adminMessage","maintenanceNotice","defaultChatId","logLevel"].forEach(k=>{if(d[k]!==undefined)o[k]=String(d[k]).slice(0,500)});
  setCfg(o);log(c.u.name,"admin","Налаштування змінено","",o)},
"admin.export"(){const q=s=>'"'+String(s).replace(/"/g,'""')+'"';return{name:"stock-"+Utilities.formatDate(new Date(),TZ,"yyyyMMdd")+".csv",csv:"\uFEFFНазва,Категорія,Кількість,Резерв,Од.,Мін.\n"+stock().items.map(i=>[i.name,i.category,i.qty,i.reserved,i.unit,i.min].map(q).join(",")).join("\n")}}
};

/* ---------- планувальник (тригер щохвилини) ---------- */
function runMaint(m){endWhere(()=>true,m.message);if(m.scenario==="logout")setCfg({maintUntil:now()+60000});log("system","restart","Рестарт: "+(m.reason||"—"))}
function maintTick(){const t=now(),hm=Utilities.formatDate(new Date(t),TZ,"HH:mm"),day=Utilities.formatDate(new Date(t),TZ,"yyyy-MM-dd");
  all("MaintenanceSchedule").filter(m=>m.status==="scheduled").forEach(m=>{
    if(m.type==="once"&&t>=Utilities.parseDate(String(m.when).replace(" ","T"),TZ,"yyyy-MM-dd'T'HH:mm").getTime()){m.status="done";upd("MaintenanceSchedule",m);runMaint(m)}
    else if(m.type==="daily"&&hm===m.daily&&m.lastRun!==day){m.lastRun=day;upd("MaintenanceSchedule",m);runMaint(m)}})}
function tg(chat,text){const p=PropertiesService.getScriptProperties(),tk=p.getProperty("TELEGRAM_BOT_TOKEN"),cid=chat||p.getProperty("TELEGRAM_CHAT_ID")||cfg().defaultChatId;
  if(!tk||!cid)return{ok:false,error:"Telegram не налаштовано"};
  try{const r=UrlFetchApp.fetch("https://api.telegram.org/bot"+tk+"/sendMessage",{method:"post",contentType:"application/json",payload:JSON.stringify({chat_id:cid,text}),muteHttpExceptions:true}),j=JSON.parse(r.getContentText());return j.ok?{ok:true}:{ok:false,error:j.description||("HTTP "+r.getResponseCode())}}
  catch(e){return{ok:false,error:"Помилка мережі"}}}
const amsg=(a,it)=>"⚠️ АПТЕКА АННЕСБУРГА — ТЕРМІНОВЕ СПОВІЩЕННЯ\n\nПредмет: "+a.item+"\nПоточний залишок: "+(it?it.qty:"невідомо")+" одиниць\nСтатус: необхідно поповнити склад.\n\nПеревірте наявність предмета та організуйте постачання."+(a.message?"\n\n"+a.message:"");
function alertTick(){const al=all("Alerts");if(!al.length)return;const by={};stock().items.forEach(i=>by[i.name]=i);const t=now();
  al.forEach(a=>{const it=by[a.item],met=!!it&&(a.condition==="zero"?it.qty<=0:a.condition==="min"?it.qty<=it.min:false);let ch=false;
    if(a.status==="finished"&&a.condition!=="manual"&&!met){a.status="armed";ch=true}
    if(a.status==="armed"&&met){a.status="running";a.sent=0;a.nextAt=t;ch=true}
    if(a.status==="running"&&+a.nextAt<=t){const n=+a.sent+1,prev=+a.nextAt;a.sent=n;a.nextAt=Math.max(prev+a.interval*60000,t+30000);if(n>=+a.repeats)a.status="finished";upd("Alerts",a);
      const r=tg(a.chatId,amsg(a,it));
      if(r.ok){a.lastError="";upd("Alerts",a);add("AlertHistory",{id:uid("G"),time:t,alertId:a.id,item:a.item,n,status:"sent",error:""})}
      else{a.sent=n-1;a.status="running";a.nextAt=t+60000;a.lastError=r.error;upd("Alerts",a);add("AlertHistory",{id:uid("G"),time:t,alertId:a.id,item:a.item,n,status:"error",error:r.error})}
      ch=false}
    if(ch)upd("Alerts",a)})}
function cleanSessions(){const rows=all("Sessions"),i=+cfg().idleMinutes,t=now();
  rows.filter(r=>r.status==="active").forEach(r=>{const s=sget(r.tokenHash);if(s&&s.st==="active"&&i>0&&t-s.last>i*60000)endSession(r.tokenHash,s,"Сесію завершено через бездіяльність.")});
  rows.filter(r=>r.status!=="active"&&t-(+r.last||0)>86400000).reverse().forEach(r=>sheet("Sessions").deleteRow(r._r))}
function tick(){const l=LockService.getScriptLock();if(!l.tryLock(30000))return;
  try{[maintTick,alertTick,cleanSessions].forEach(f=>{try{f()}catch(e){logErr(e)}})}finally{l.releaseLock()}}

/* ---------- первинне налаштування: запустити вручну один раз ---------- */
function setup(){
  const ss=SpreadsheetApp.getActive();
  Object.keys(SH).forEach(n=>{const s=ss.getSheetByName(n)||ss.insertSheet(n);if(s.getLastRow()<1){s.getRange(1,1,1,SH[n].length).setValues([SH[n]]).setFontWeight("bold");s.setFrozenRows(1)}});
  ["Sheet1","Аркуш1"].forEach(n=>{const s=ss.getSheetByName(n);if(s&&s.getLastRow()===0&&ss.getSheets().length>1)ss.deleteSheet(s)});
  if(!all("SiteSettings").length)addMany("SiteSettings",Object.entries({idleMinutes:15,capacity:3500,adminMessage:"",maintenanceNotice:"",defaultChatId:"",logLevel:"all",maintUntil:0}).map(([key,value])=>({key,value})));
  if(!all("Recipes").length){const nm={},items=[],rec=[],ri=[];
    const need=(n,c)=>{if(!nm[n]){nm[n]={id:"I"+String(items.length+1).padStart(3,"0"),name:n,category:c,unit:"шт",min:0,note:"",active:1};items.push(nm[n])}};
    SEED.forEach(([c,n])=>need(n,CATS[c]));
    SEED.forEach(([c,n,sk,t,y,ing],i)=>{const id="R"+String(i+1).padStart(3,"0");rec.push({id,name:n,cat:CATS[c],skill:sk,time:t,yield:y,status:ing?"active":"na",enabled:1,version:1,updated:now()});
      if(ing)Object.entries(ing).forEach(([k,q])=>{need(k,RAW);ri.push({recipeId:id,item:k,qty:q})})});
    addMany("Items",items);addMany("Inventory",items.map(i=>({itemId:i.id,qty:0,updated:now()})));addMany("Recipes",rec);addMany("RecipeIngredients",ri)}
  if(!all("Users").length){const pw=Utilities.getUuid().slice(0,10);
    add("Users",{id:uid("U"),name:"Адміністратор",login:"admin",hash:newHash(pw),role:"admin",perms:"",skill:10,status:"active",created:now(),lastLogin:"",notes:"Створено при setup"});
    console.log("ЛОГІН: admin   ПАРОЛЬ: "+pw+"   (змініть після першого входу)")}
  ScriptApp.getProjectTriggers().filter(t=>t.getHandlerFunction()==="tick").forEach(t=>ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("tick").timeBased().everyMinutes(1).create();
  console.log("Готово. Додайте TELEGRAM_BOT_TOKEN і TELEGRAM_CHAT_ID у Властивості скрипта, потім Deploy → Web app.")}
