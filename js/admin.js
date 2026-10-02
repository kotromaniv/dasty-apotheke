let AT="users";
const TABS={
users:b=>{page(b,"Користувачі","admin.users",{},d=>tbl([["name","Ім'я"],["login","Логін"],["role","Роль"],["status","Статус"],["lastLogin","Останній вхід"],["a","",o=>ra(o.id,[[o.status==="blocked"?"unblock":"block",o.status==="blocked"?"Розблок.":"Блок."],["reset","Пароль"],["kick","Кік"]])]],d),`<button class="btn" id="b1">Новий користувач</button>`);
  $("#b1").onclick=()=>form("Новий користувач",[{k:"name",l:"Ігрове ім'я"},{k:"login",l:"Логін"},{k:"password",l:"Тимчасовий пароль",t:"password"},{k:"role",l:"Роль",o:[["employee","Співробітник"],["admin","Адміністратор"]]},{k:"skill",l:"Рівень уміння",t:"number",v:1},{k:"perms",l:"Дозволи (через кому: stock,stock_edit,craft,goods,orders,prices)",v:"stock,craft,goods,orders,prices"},{k:"notes",l:"Примітки"}],async x=>{await api("admin.userSave",x);go("admin")});
  b.onclick=async e=>{const t=e.target.closest("[data-a]");if(!t)return;const{a,id}=t.dataset;
    if(a==="reset"){const pw=prompt("Новий тимчасовий пароль:");if(!pw)return;await act("admin.userReset",{id,password:pw})}
    else if(a==="kick")await act("admin.kick",{userId:id});
    else await act("admin.userStatus",{id,status:a==="block"?"blocked":"active"});
    go("admin")}},
sessions:b=>{page(b,"Активні сесії","admin.sessions",{},d=>tbl([["user","Користувач"],["start","Початок"],["last","Остання активність"],["a","",o=>ra(o.id,[["kick","Кік"],["full","Повний повторний вхід"]])]],d),`<button class="btn" id="b1">Кікнути всіх</button>`);
  $("#b1").onclick=async()=>{if(confirm("Відключити всіх користувачів?")&&await act("admin.kick",{all:true}))go("admin")};
  b.onclick=async e=>{const t=e.target.closest("[data-a]");if(t&&await act("admin.kick",{sessionId:t.dataset.id,full:t.dataset.a==="full"}))go("admin")}},
recipes:b=>{let L=[];
  const ed=o=>form(o?"Редагувати рецепт":"Новий рецепт",[{k:"name",l:"Назва",v:o?.name},{k:"cat",l:"Категорія",o:CATS.map((c,i)=>[i,c])},{k:"skill",l:"Вміння",t:"number",v:o?.skill??1},{k:"time",l:"Час, с",t:"number",v:o?.time??30},{k:"yield",l:"Вихід",t:"number",v:o?.yield??1},{k:"ing",l:"Інгредієнти (рядок: Назва:кількість)",t:"area",v:o?Object.entries(o.ing||{}).map(([n,q])=>n+":"+q).join("\n"):""},{k:"enabled",l:"Доступність",o:[["1","Доступний"],["0","Вимкнено"]]}],async x=>{
    x.ing=Object.fromEntries(x.ing.split("\n").map(s=>s.trim()).filter(Boolean).map(s=>{const[n,q]=s.split(":");return[n.trim(),+q]}));x.cat=+x.cat;if(o)x.id=o.id;await api("admin.recipeSave",x);go("admin")});
  page(b,"Рецепти","admin.recipes",{},d=>{L=d;return tbl([["name","Назва"],["cat","Категорія",o=>esc(CATS[o.cat])],["skill","Вміння"],["time","Час"],["yield","Вихід"],["enabled","Увімк.",o=>o.enabled?"так":"ні"],["a","",o=>ra(o.id,[["edit","Змінити"],["archive","Архів"]])]],d)},`<button class="btn" id="b1">Новий рецепт</button>`);
  $("#b1").onclick=()=>ed();
  b.onclick=async e=>{const t=e.target.closest("[data-a]");if(!t)return;if(t.dataset.a==="edit")ed(L.find(r=>r.id===t.dataset.id));else if(await act("admin.recipeArchive",{id:t.dataset.id}))go("admin")}},
maint:b=>{page(b,"Рестарти / технічні роботи (Europe/Kyiv)","admin.maintList",{},d=>tbl([["when","Коли"],["type","Тип"],["reason","Причина"],["status","Статус"],["a","",o=>ra(o.id,[["cancel","Скасувати"]])]],d),`<button class="btn" id="b1">Запланувати</button>`);
  $("#b1").onclick=()=>form("Рестарт",[{k:"type",l:"Тип",o:[["now","Негайно"],["once","Одноразово"],["daily","Щодня"]]},{k:"when",l:"Дата й час (Київ) для одноразового",t:"datetime-local"},{k:"daily",l:"Час щодня (ГГ:ХХ)"},{k:"scenario",l:"Сценарій",o:[["logout","Завершити сесії"],["reconnect","Примусове перепідключення"]]},{k:"reason",l:"Причина"},{k:"message",l:"Повідомлення",v:"Потрібно перепідключитися. Всі підтверджені дії збережені."}],async x=>{await api("admin.maintenance",x);go("admin")});
  b.onclick=async e=>{const t=e.target.closest("[data-a]");if(t&&await act("admin.maintCancel",{id:t.dataset.id}))go("admin")}},
settings:b=>{const K=[["idleMinutes","Бездіяльність до відключення, хв","number"],["capacity","Складський ліміт","number"],["adminMessage","Повідомлення на головній"],["maintenanceNotice","Заплановані технічні роботи"],["defaultChatId","Telegram chat ID за замовчуванням"],["logLevel","Рівень журналювання"]];
  page(b,"Налаштування","admin.settings",{},d=>K.map(([k,l,t])=>`<label>${l}</label><input id="s_${k}" type="${t||"text"}" value="${esc(d[k]??"")}">`).join("")+`<p class="meta" style="margin-top:10px">Токен Telegram зберігається лише в Script Properties.</p>`,`<button class="btn" id="b1">Зберегти</button><button class="btn ghost" id="b2">Експорт даних</button>`);
  $("#b1").onclick=async()=>{const d={};K.forEach(([k,,t])=>{const e=$("#s_"+k);if(e)d[k]=t?+e.value:e.value});await act("admin.settingsSave",d);CONFIG.CAPACITY=d.capacity||CONFIG.CAPACITY};
  $("#b2").onclick=async()=>{try{const f=await api("admin.export");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([f.csv],{type:"text/csv"}));a.download=f.name||"export.csv";a.click()}catch(e){toast(e.message,"er")}}}
};
VIEWS.admin=v=>{
  if(!isAdmin()){v.innerHTML='<div class="warn">Доступ заборонено</div>';return}
  const T={users:"Користувачі",sessions:"Сесії",recipes:"Рецепти",maint:"Рестарти",settings:"Налаштування"};
  v.innerHTML=`<div class="top"><h2>🛡️ Адмін-панель</h2></div><div class="chips">${Object.entries(T).map(([k,l])=>`<span class="chip ${k===AT?"on":""}" data-t="${k}">${l}</span>`).join("")}</div><div id="at"></div>`;
  v.onclick=e=>{const t=e.target.dataset.t;if(t){AT=t;VIEWS.admin(v)}};
  TABS[AT]($("#at"));
};
