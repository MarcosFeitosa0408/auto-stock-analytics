/* AutoStock Analytics — dashboard administrativo (demo ou banco RLS). */
(async () => {
  'use strict';
  const ctx = await window.AutoAuth.guard('admin');
  if (!ctx) return;
  const isDemo = ctx.mode === 'demo';
  const C = window.StockCore;
  const STORAGE = 'autostock-analytics-v1';
  const el = id => document.getElementById(id);
  const money = n => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(n);
  const shortMoney = n => n >= 1e6 ? `R$ ${(n/1e6).toLocaleString('pt-BR',{maximumFractionDigits:1})} mi` : n >= 1000 ? `R$ ${(n/1000).toLocaleString('pt-BR',{maximumFractionDigits:0})} mil` : money(n);
  const safe = C.escapeHTML;
  const today = () => new Date().toISOString().slice(0,10);
  const initial = () => {
    try { const raw=JSON.parse(localStorage.getItem(STORAGE)); if(Array.isArray(raw)) return raw.map(v=>({...C.normalizeVehicle(v),imagem_url:v.imagem_url||''})); }
    catch(e){console.warn('Dados locais inválidos; demo restaurada',e);}
    return C.DEMO.map(v=>({...v}));
  };
  let vehicles=isDemo?initial():[]; let editing=null;
  const images=['assets/photos/suv-azul.jpg','assets/photos/suv-prata.jpg','assets/photos/suv-executivo.jpg'];
  const photo=v=>/^https:\/\//i.test(v.imagem_url||'')?v.imagem_url:images[[...v.id].reduce((n,c)=>n+c.charCodeAt(0),0)%images.length];
  function dbRow(v){return {...v, venda:v.venda||null, imagem_url:v.imagem_url||null};}
  async function putVehicle(v){if(isDemo)return;const {error}=await ctx.client.from('vehicles').upsert(dbRow(v));if(error)throw error;}
  async function deleteVehicle(id){if(isDemo)return;const {error}=await ctx.client.from('vehicles').delete().eq('id',id);if(error)throw error;}
  async function loadRemote(){
    if(isDemo)return;
    const {data,error}=await ctx.client.from('vehicles').select('*').order('cadastro',{ascending:false});
    if(error)throw error;
    vehicles=(data||[]).map(x=>({...C.normalizeVehicle(x),imagem_url:x.imagem_url||''}));
  }
  let toastTimer;
  function save(){try {localStorage.setItem(STORAGE,JSON.stringify(vehicles));}catch(e){toast('Não foi possível salvar no navegador.');}}
  function toast(message){const node=el('toast');node.textContent=message;node.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove('show'),3300);}
  function refresh(){
    const m=C.metrics(vehicles);
    el('kpi-estoque').textContent=m.disponiveis+m.reservados;
    el('kpi-estoque-caption').textContent=`${m.disponiveis} disponíveis · ${m.reservados} reservados`;
    el('kpi-capital').textContent=money(m.capitalEstoque);
    el('kpi-receita').textContent=money(m.receita);
    el('kpi-lucro').textContent=money(m.lucroBruto);
    el('kpi-margem').textContent=`Margem bruta: ${m.margemBruta.toLocaleString('pt-BR')}%`;
    el('count-available').textContent=m.disponiveis;
    el('count-reserved').textContent=m.reservados;
    el('count-sold').textContent=m.vendidos;
    el('ring-value').innerHTML=`${m.total}<small>VEÍCULOS</small>`;
    const p1=m.total?100*m.disponiveis/m.total:0, p2=m.total?100*(m.disponiveis+m.reservados)/m.total:0;
    el('status-ring').style.background=`conic-gradient(#5b86ff 0 ${p1}%, #aa78ec ${p1}% ${p2}%, #35cfa9 ${p2}% 100%)`;
    el('extra-metrics').textContent=`Ticket médio: ${money(m.ticketMedio)} · Potencial de vendas: ${money(m.potencialVenda)}`;
    el('purchase-total').textContent=money(vehicles.reduce((a,v)=>a+v.custo,0));
    el('purchase-count').textContent=vehicles.length;
    el('sales-count').textContent=m.vendidos;
    const purchases={};
    for(const v of vehicles) if(/^\d{4}-\d{2}-\d{2}$/.test(v.cadastro)){
      const month=v.cadastro.slice(0,7);purchases[month]=(purchases[month]||0)+v.custo;
    }
    const monthlyPurchase=Object.entries(purchases).sort(([a],[b])=>a.localeCompare(b)).slice(-6);
    const pc=el('purchase-chart');
    if(!monthlyPurchase.length)pc.innerHTML='<p class="empty">Ainda não há compras registradas.</p>';
    else{const max=Math.max(...monthlyPurchase.map(([,n])=>n),1);pc.innerHTML=monthlyPurchase.map(([mes,n])=>`<div class="bar-col"><div class="bar-value">${safe(shortMoney(n))}</div><div class="bar" style="height:${Math.max(5,n/max*115)}px"></div><span>${safe(new Date(mes+'-15T12:00:00').toLocaleDateString('pt-BR',{month:'short',year:'2-digit'}))}</span></div>`).join('');}
    const months=C.byMonth(vehicles).slice(-6);const chart=el('monthly-chart');
    if(!months.length) chart.innerHTML='<p class="empty">Nenhuma venda com data registrada.</p>';
    else {const max=Math.max(...months.map(v=>v.receita),1);chart.innerHTML=months.map(v=>`<div class="bar-col"><div class="bar-value" title="${safe(money(v.receita))}">${safe(shortMoney(v.receita))}</div><div class="bar" style="height:${Math.max(v.receita/max*115,5)}px"></div><span>${safe(new Date(v.mes+'-15T12:00:00').toLocaleDateString('pt-BR',{month:'short',year:'2-digit'}))}</span></div>`).join('');}
    const brands=Array.from(new Set(vehicles.map(v=>v.marca))).sort((a,b)=>a.localeCompare(b,'pt-BR'));
    const oldBrand=el('filter-brand').value;
    el('filter-brand').innerHTML='<option value="">Todas as marcas</option>'+brands.map(x=>`<option value="${safe(x)}">${safe(x)}</option>`).join('');
    el('filter-brand').value=brands.includes(oldBrand)?oldBrand:'';
    renderTable();
  }
  function renderTable(){
    const q=el('search').value.trim().toLocaleLowerCase('pt-BR'),status=el('filter-status').value,brand=el('filter-brand').value;
    const filtered=vehicles.filter(v=>(!q||[v.marca,v.modelo,v.id,v.categoria].join(' ').toLocaleLowerCase('pt-BR').includes(q))&&(!status||v.status===status)&&(!brand||v.marca===brand));
    el('record-count').textContent=`${filtered.length} de ${vehicles.length} veículos`;
    el('empty-state').hidden=filtered.length!==0;
    el('vehicle-table').innerHTML=filtered.map(v=>{
      const badge=v.status==='Disponível'?'available':v.status==='Reservado'?'reserved':'sold';
      return `<tr><td><div class="vehicle-line"><img class="vehicle-thumb" src="${safe(photo(v))}" alt="Foto ilustrativa do veículo" loading="lazy"><span><strong>${safe(v.marca)} ${safe(v.modelo)}</strong><small>${safe(v.id)}</small></span></div></td><td>${v.ano}</td><td>${safe(v.categoria)}</td><td>${safe(money(v.preco))}</td><td><span class="status ${badge}">${safe(v.status)}</span></td><td><div class="row-actions"><button class="mini-button" data-action="edit" data-id="${safe(v.id)}">Editar</button><button class="mini-button danger" data-action="delete" data-id="${safe(v.id)}">Excluir</button></div></td></tr>`;
    }).join('');
  }
  function openForm(id){
    editing=id||null;
    const form=el('vehicle-form');form.reset();
    el('modal-title').textContent=id?'Editar veículo':'Novo veículo';
    const v=vehicles.find(x=>x.id===id);
    if(v) for(const name of ['marca','modelo','ano','categoria','preco','custo','status','venda','imagem_url'])form.elements[name].value=v[name]??'';
    else {form.elements.ano.value=new Date().getFullYear();form.elements.status.value='Disponível';}
    el('vehicle-dialog').showModal();
  }
  el('new-vehicle').addEventListener('click',()=>openForm());
  el('close-dialog').addEventListener('click',()=>el('vehicle-dialog').close());
  el('cancel-dialog').addEventListener('click',()=>el('vehicle-dialog').close());
  el('vehicle-form').addEventListener('submit',async ev=>{
    ev.preventDefault();const form=ev.currentTarget;
    const previous=vehicles.find(v=>v.id===editing);
    const id=editing||`AV-${Date.now().toString(36).toUpperCase()}`;
    const raw={id,marca:form.elements.marca.value,modelo:form.elements.modelo.value,ano:form.elements.ano.value,
      categoria:form.elements.categoria.value,preco:form.elements.preco.value,custo:form.elements.custo.value,
      status:form.elements.status.value,cadastro:previous?.cadastro||today(),
      venda:form.elements.status.value==='Vendido'?(form.elements.venda.value||previous?.venda||today()):''};
    try{
      const imageUrl=form.elements.imagem_url.value.trim();
      if(imageUrl && !/^https:\/\//i.test(imageUrl))throw new Error('A foto deve usar uma URL HTTPS.');
      const v={...C.normalizeVehicle(raw),imagem_url:imageUrl};
      await putVehicle(v);
      if(editing)vehicles=vehicles.map(x=>x.id===editing?v:x);else vehicles.unshift(v);
      if(isDemo)save();refresh();el('vehicle-dialog').close();toast(editing?'Veículo atualizado.':'Veículo cadastrado.');
    }catch(e){toast('Falha ao salvar: '+e.message);} 
  });
  el('vehicle-table').addEventListener('click',async ev=>{
    const b=ev.target.closest('button[data-action]');if(!b)return;
    const {action,id}=b.dataset;
    if(action==='edit')openForm(id);
    else if(action==='delete'&&window.confirm(`Excluir o veículo ${id}?`)){try{await deleteVehicle(id);vehicles=vehicles.filter(x=>x.id!==id);if(isDemo)save();refresh();toast('Veículo removido.');}catch(e){toast('Falha ao excluir: '+e.message);}}
  });
  for(const id of ['search','filter-status','filter-brand']) el(id).addEventListener(id==='search'?'input':'change',renderTable);
  function download(filename,text){const blob=new Blob([text],{type:'text/csv;charset=utf-8'});const href=URL.createObjectURL(blob);const a=document.createElement('a');a.href=href;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(href),2500);}
  el('export-csv').addEventListener('click',()=>download('autostock-veiculos.csv',C.toCSV(vehicles)));
  el('import-csv').addEventListener('change',async ev=>{
    const file=ev.currentTarget.files?.[0];if(!file)return;
    try{const parsed=C.parseCSV(await file.text());const prompt=isDemo?`Substituir o estoque local por ${parsed.length} registros deste CSV?`:`Importar/atualizar ${parsed.length} registros no banco, sem excluir os já existentes?`;if(window.confirm(prompt)){
      if(isDemo){vehicles=parsed;save();}else{
        for(let i=0;i<parsed.length;i+=100){const {error}=await ctx.client.from('vehicles').upsert(parsed.slice(i,i+100).map(dbRow));if(error)throw error;}
        await loadRemote();
      }
      refresh();toast(`${parsed.length} veículos importados.`);
    }}
    catch(e){toast('Falha na importação: '+e.message);}finally{ev.currentTarget.value='';}
  });
  el('reset-demo').hidden=!isDemo;
  el('admin-logout').addEventListener('click',()=>window.AutoAuth.logout());
  el('reset-demo').addEventListener('click',()=>{if(window.confirm('Restaurar os dados fictícios de demonstração? Seu estoque local atual será substituído.')){vehicles=C.DEMO.map(x=>({...x}));save();refresh();toast('Dados de demonstração restaurados.');}});
  el('menu-toggle').addEventListener('click',()=>document.querySelector('.sidebar').classList.toggle('open'));
  document.querySelectorAll('.nav-link').forEach(a=>a.addEventListener('click',()=>{document.querySelectorAll('.nav-link').forEach(x=>x.classList.remove('current'));a.classList.add('current');document.querySelector('.sidebar').classList.remove('open');}));
  try{await loadRemote();}catch(e){console.error(e);toast('Falha ao carregar veículos do banco: '+e.message);}
  refresh();
  window.addEventListener('autostock-inventory-change',async()=>{try{await loadRemote();refresh();}catch(e){toast(e.message);}});
})();
