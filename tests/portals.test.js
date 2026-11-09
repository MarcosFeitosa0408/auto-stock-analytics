const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
test('portais e scripts essenciais estão referenciados',()=>{
  const main=read('index.html'),client=read('cliente.html'),admin=read('admin.html');
  for(const token of ['data-open-auth="cliente"','data-open-auth="admin"','data-demo="cliente"','data-demo="admin"','assets/auth.js']) assert.ok(main.includes(token),token);
  for(const token of ['id="client-cards"','id="client-requests"','assets/client.js','assets/auth.js'])assert.ok(client.includes(token),token);
  for(const token of ['id="purchase-chart"','id="admin-requests-list"','assets/admin-requests.js','assets/auth.js'])assert.ok(admin.includes(token),token);
});
test('portal cliente não contém tabelas de custo ou lucro administrativo',()=>{
  const client=read('cliente.html');
  assert.doesNotMatch(client,/kpi-capital|kpi-lucro|custo de aquisiç[aã]o/i);
});
test('login público não tem credenciais padrão e requer supabase para acesso real',()=>{
  const cfg=read('assets/config.js'),auth=read('assets/auth.js');
  assert.match(cfg,/supabaseAnonKey: ''/);
  assert.doesNotMatch(auth,/APP_ADMIN_PASSWORD|password\s*===|senha\s*===/);
  assert.match(auth,/signInWithPassword/);
  assert.match(auth,/roleFor\(data.user\)/);
});
test('SQL separa papéis e exige segurança RLS para estoque e solicitações',()=>{
  const sql=read('supabase/schema.sql');
  for(const token of ['row level security','role = \'admin\'','catalogo_veiculos','autostock_concluir_pedido','auth.uid()','on_autostock_user_created'])assert.ok(sql.includes(token),token);
  assert.match(sql,/select id, marca, modelo, ano, categoria, preco, status, imagem_url\s+from public\.vehicles/);
});
