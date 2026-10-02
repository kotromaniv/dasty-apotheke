VIEWS.profile=v=>{
  page(v,"👤 Профіль","profile.get",{},d=>`<div class="row">${[["Ім'я",d.name],["Логін",d.login],["Роль",d.role],["Створено",d.created],["Останній вхід",d.lastLogin],["Крафтів",d.crafts]].map(([l,x])=>`<div><span class="meta">${l}</span><br><b>${esc(x??"—")}</b></div>`).join("")}</div><h3 style="margin-top:16px">Мої операції</h3>${tbl([["time","Час"],["type","Тип"],["desc","Опис"]],d.history)}`,`<button class="btn" id="b1">Змінити пароль</button>`).then(()=>{
    v.insertAdjacentHTML("beforeend",`<div class="card" style="margin-top:14px"><h3>Звук</h3><label><input type="checkbox" id="am" style="width:auto"> Фонова музика</label><label><input type="checkbox" id="as" style="width:auto"> Звукові ефекти</label><label>Гучність</label><input type="range" id="av" min="0" max="1" step=".05"></div>`);
    $("#am").checked=AU.on;$("#as").checked=AU.sfx;$("#av").value=AU.vol;
    $("#am").onchange=e=>{AU.on=e.target.checked;auSave();music()};$("#as").onchange=e=>{AU.sfx=e.target.checked;auSave()};$("#av").oninput=e=>{AU.vol=+e.target.value;auSave();if(mus)mus.g.gain.value=AU.vol*.25};
  });
  $("#b1").onclick=()=>form("Зміна пароля",[{k:"old",l:"Поточний пароль",t:"password"},{k:"pw",l:"Новий пароль",t:"password"}],async x=>{await api("profile.password",x);toast("Пароль змінено")});
};
