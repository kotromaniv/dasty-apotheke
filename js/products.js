VIEWS.goods=v=>{
  page(v,"🛒 Товари","products.list",{},d=>tbl([["name","Назва"],["category","Категорія"],["qty","К-сть"],["reserved","Резерв"],["price","Ціна/од."],["status","Статус"],["by","Автор"],["a","",o=>ra(o.id,[["sold","Продано"],["off","Зняти"]])]],d),`<button class="btn" id="b1">Нова пропозиція</button>`);
  $("#b1").onclick=()=>form("Нова пропозиція",[{k:"name",l:"Товар",o:RECIPES.filter(r=>!r.na).map(r=>r.name)},{k:"qty",l:"Кількість",t:"number"},{k:"price",l:"Ціна за одиницю",t:"number"},{k:"note",l:"Примітка"}],async x=>{await api("products.save",x);go("goods")});
  v.onclick=async e=>{const b=e.target.closest("[data-a]");if(b&&await act("products.status",{id:b.dataset.id,status:b.dataset.a}))go("goods")};
};
