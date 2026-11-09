/* Vitrine do cliente; somente colunas públicas chegam da base no modo real. */
(async () => {
  'use strict';
  const $ = id=>document.getElementById(id);
  const safe = window.StockCore.escapeHTML;
  const cash = n=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(n)||0);
  const key = 'autostock-demo-requests-v1';
  const inventoryKey = 'autostock-analytics-v1';
  let demoInventory=[];
  const Photos=window.AutoStockPhotos;
  const ctx=await window.AutoAuth.guard('cliente');if(!ctx)return;
  let cars=[],requests=[];
  function toast(msg){$('client-toast').textContent=msg;$('client-toast').classList.add('show');setTimeout(()=>$('client-toast').classList.remove('show'),3800);}
  async function load(){
    if(ctx.mode==='demo'){
      demoInventory=window.StockCore.loadDemoInventory(localStorage);
      cars=demoInventory.filter(v=>v.status==='Disponível').map(v=>({...v}));
      try{const arr=JSON.parse(localStorage.getItem(key)||'[]');requests=Array.isArray(arr)?arr:[];}catch{requests=[];}
    }else{
      const [a,b]=await Promise.all([ctx.client.from('catalogo_veiculos').select('id,marca,modelo,ano,categoria,preco,imagem_url,status').order('ano',{ascending:false}),ctx.client.from('pedidos').select('id,veiculo_id,status,created_at').order('created_at',{ascending:false})]);
      if(a.error)throw a.error;if(b.error)throw b.error;
      cars=a.data||[];requests=b.data||[];
    }
    populateBrands();render();renderRequests();
  }
  function populateBrands(){
    const selected=$('client-brand').value;
    const brands=[...new Set(cars.map(v=>v.marca))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
    $('client-brand').innerHTML='<option value="">Todas as marcas</option>'+brands.map(x=>'<option value="'+safe(x)+'">'+safe(x)+'</option>').join('');
    $('client-brand').value=brands.includes(selected)?selected:'';
  }
  function render(){
    const q=$('client-search').value.trim().toLocaleLowerCase('pt-BR');const cat=$('client-category').value;const brand=$('client-brand').value;
    const list=cars.filter(v=>(!q||`${v.marca} ${v.modelo}`.toLocaleLowerCase('pt-BR').includes(q))&&(!cat||v.categoria===cat)&&(!brand||v.marca===brand));
    if($('client-sort').value==='menor')list.sort((a,b)=>a.preco-b.preco);
    if($('client-sort').value==='maior')list.sort((a,b)=>b.preco-a.preco);
    $('client-count').textContent=`${list.length} veículo(s) encontrado(s)`;
    $('client-cards').innerHTML=list.length?list.map(v=>{
      const img=Photos.resolve(v);
      const credit=img.kind==='reference'?'<span class="photo-credit">Referência: '+safe(img.description)+'. <a href="'+safe(img.source)+'" target="_blank" rel="noopener noreferrer">Créditos: '+safe(img.credit)+' · '+safe(img.license)+'</a></span>':img.kind==='missing'?'<span class="photo-credit">Foto não cadastrada para este modelo.</span>':'<span class="photo-credit">Fotografia fornecida pelo anunciante.</span>';
      return `<article class="vehicle-card"><div class="photo-wrap"><img class="vehicle-photo" src="${safe(img.url)}" alt="${safe(img.caption)}" title="${safe(img.caption)}" onerror="this.onerror=null;this.src='assets/photos/sem-foto.svg';this.alt='Foto indisponível';" loading="lazy"><span class="stock-tag">● Disponível</span></div><div class="vehicle-detail"><h3>${safe(v.marca+' '+v.modelo)}</h3><span class="vehicle-meta">${safe(v.ano)} · ${safe(v.categoria)}</span><strong class="vehicle-price">${cash(v.preco)}</strong>${credit}<button class="btn gold" data-vehicle="${safe(v.id)}">Tenho interesse →</button></div></article>`;
    }).join(''):'<div class="catalog-empty">Nenhum veículo disponível para este filtro.</div>';
  }
  function renderRequests(){
    const names=Object.fromEntries([...cars,...demoInventory,...window.StockCore.DEMO].map(v=>[v.id,`${v.marca} ${v.modelo}`]));
    $('client-requests').innerHTML=requests.length?requests.map(p=>`<article class="request-row"><div><strong>${safe(names[p.veiculo_id]||p.veiculo_id)}</strong><small>Solicitação Nº ${safe(p.id)} · ${new Date(p.created_at).toLocaleDateString('pt-BR')}</small></div><span class="request-status ${safe(p.status)}">${safe(p.status)}</span></article>`).join(''):'<div class="catalog-empty">Você ainda não enviou solicitações.</div>';
  }
  $('client-cards').addEventListener('click',async e=>{
    const b=e.target.closest('[data-vehicle]');if(!b)return;
    const v=cars.find(x=>x.id===b.dataset.vehicle);if(!v)return;
    if(!confirm(`Solicitar contato sobre ${v.marca} ${v.modelo}? Nenhuma compra ou pagamento será realizado.`))return;
    b.disabled=true;
    try{
      if(ctx.mode==='demo'){
        if(requests.some(p=>p.veiculo_id===v.id&&p.status==='Pendente'))throw new Error('Já existe uma solicitação pendente para este veículo.');
        const p={id:`DEMO-${Date.now().toString(36)}`,veiculo_id:v.id,status:'Pendente',created_at:new Date().toISOString()};requests.unshift(p);
        localStorage.setItem(key,JSON.stringify(requests));
      }else{
        const {error}=await ctx.client.from('pedidos').insert({veiculo_id:v.id,cliente_id:ctx.user.id});if(error)throw error;
        const {data,error:loadError}=await ctx.client.from('pedidos').select('id,veiculo_id,status,created_at').order('created_at',{ascending:false});if(loadError)throw loadError;requests=data;
      }
      renderRequests();toast('Solicitação registrada. Consulte o acompanhamento abaixo.');$('meus-pedidos').scrollIntoView({behavior:'smooth'});
    }catch(err){toast('Não foi possível registrar: '+err.message);}finally{b.disabled=false;}
  });
  ['client-search','client-category','client-brand','client-sort'].forEach(id=>$(id).addEventListener(id==='client-search'?'input':'change',render));
  $('logout').addEventListener('click',()=>window.AutoAuth.logout());
  window.addEventListener('storage',e=>{if(ctx.mode==='demo' && (e.key===inventoryKey||e.key===key))load().catch(console.error);});
  try{await load();}catch(err){console.error(err);$('client-count').textContent='Erro ao carregar o catálogo.';$('client-cards').innerHTML='<div class="catalog-empty">Não foi possível carregar os veículos. Confira a configuração do banco de dados e as permissões de acesso.</div>';}
})();
