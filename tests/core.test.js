const test=require('node:test');
const assert=require('node:assert/strict');
const {DEMO,metrics,byMonth,parseCSV,toCSV,normalizeVehicle,escapeHTML}=require('../assets/core');
test('indicadores calculam receita, custo e lucro sem misturar estoque disponível',()=>{
  const m=metrics(DEMO),sold=DEMO.filter(v=>v.status==='Vendido');
  assert.equal(m.receita,sold.reduce((sum,v)=>sum+v.preco,0));
  assert.equal(m.lucroBruto,sold.reduce((sum,v)=>sum+v.preco-v.custo,0));
  assert.equal(m.disponiveis+m.reservados+m.vendidos,m.total);
});
test('receita mensal considera somente vendas datadas',()=>{
  const result=byMonth(DEMO);assert.ok(result.length>0);
  assert.equal(result.reduce((s,m)=>s+m.receita,0),metrics(DEMO).receita);
});
test('exportação e importação CSV preservam dados e caracteres acentuados',()=>{
  const exported=toCSV(DEMO);const loaded=parseCSV(exported);
  assert.deepEqual(loaded,DEMO.map(normalizeVehicle));
});
test('CSV rejeita identificadores duplicados',()=>{
  const [head,first]=toCSV([DEMO[0]]).trim().split(/\r?\n/);
  assert.throws(()=>parseCSV([head,first,first].join('\n')),/duplicado/);
});
test('rejeita ano inválido e status inexistente',()=>{
  assert.throws(()=>normalizeVehicle({...DEMO[0],ano:0}),/Ano/);
  assert.throws(()=>normalizeVehicle({...DEMO[0],status:'Em trânsito'}),/Situação/);
});
test('protege interface contra HTML não confiável',()=>assert.equal(escapeHTML('<img src="x">'),'&lt;img src=&quot;x&quot;&gt;'));
