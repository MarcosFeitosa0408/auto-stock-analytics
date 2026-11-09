/* Solicitações de compra: acesso administrativo; vendas concluídas via RPC atômica. */
(async () => {
  'use strict';
  const ctx=await window.AutoAuth.guard('admin');if(!ctx)return;
  const root=document.getElementById('admin-requests-list');
  const safe=window.StockCore.escapeHTML;
  const KEY='autostock-demo-requests-v1';
  const VEHICLES='autostock-analytics-v1';
  let pedidos=[];
  function demoPedidos(){try{const a=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(a)?a:[];}catch{return [];}}
  async function load(){
    if(ctx.mode==='demo')pedidos=demoPedidos();
    else{const {data,error}=await ctx.client.from('pedidos').select('id,veiculo_id,cliente_id,status,created_at').order('created_at',{ascending:false}).limit(100);if(error)throw error;pedidos=data||[];}
    render();
  }
  function render(){
    root.innerHTML=pedidos.length?pedidos.map(p=>`<div class="request-item"><div><strong>Veículo ${safe(p.veiculo_id)}</strong><p>Solicitação #${safe(p.id)} · ${new Date(p.created_at).toLocaleDateString('pt-BR')} · ${safe(p.cliente_id?'Cliente '+p.cliente_id.slice(0,8):'Cliente de demonstração')}</p></div><div class="buttons"><span class="status-tag">${safe(p.status)}</span>${p.status==='Pendente'||p.status==='Em negociação'?`<button class="mini-button" data-id="${safe(p.id)}" data-status="Concluído">Concluir venda</button><button class="mini-button danger" data-id="${safe(p.id)}" data-status="Cancelado">Cancelar</button>`:''}</div></div>`).join(''):'<p class="empty">Nenhuma solicitação recebida até o momento.</p>';
  }
  root.addEventListener('click',async e=>{
    const button=e.target.closest('button[data-status]');if(!button)return;
    const {id,status}=button.dataset;const p=pedidos.find(p=>String(p.id)===id);if(!p)return;
    if(!confirm(status==='Concluído'?`Confirmar a venda real do veículo ${p.veiculo_id}? Esta ação marcará o veículo como vendido.`:'Cancelar esta solicitação?'))return;
    button.disabled=true;
    try{
      if(ctx.mode==='demo'){
        const source=demoPedidos();const target=source.find(o=>String(o.id)===id);
        if(target)target.status=status;
        if(status==='Concluído'){
          const inventory=JSON.parse(localStorage.getItem(VEHICLES)||'null')||window.StockCore.DEMO;
          const car=inventory.find(c=>c.id===p.veiculo_id);
          if(!car||car.status!=='Disponível')throw new Error('Este veículo não está disponível para venda.');
          car.status='Vendido';car.venda=new Date().toISOString().slice(0,10);
          localStorage.setItem(VEHICLES,JSON.stringify(inventory));
        }
        localStorage.setItem(KEY,JSON.stringify(source));
      }else if(status==='Concluído'){
        const {error}=await ctx.client.rpc('autostock_concluir_pedido',{p_id:p.id});if(error)throw error;
      }else{
        const {error}=await ctx.client.from('pedidos').update({status}).eq('id',p.id);if(error)throw error;
      }
      await load();window.dispatchEvent(new Event('autostock-inventory-change'));
      if(ctx.mode==='demo'&&status==='Concluído')location.reload();
    }catch(err){alert('Não foi possível atualizar a solicitação: '+err.message);}finally{button.disabled=false;}
  });
  document.getElementById('reload-requests').addEventListener('click',()=>load().catch(e=>alert(e.message)));
  try{await load();}catch(err){console.error(err);root.innerHTML='<p class="empty">Não foi possível carregar as solicitações. Confira a conexão e as permissões.</p>';}
})();
