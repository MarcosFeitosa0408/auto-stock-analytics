/* AutoStock Analytics — lógica independente do DOM. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.StockCore = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';
  const STATUS = ['Disponível', 'Reservado', 'Vendido'];
  const DEMO = [
    { id: 'AV-1001', marca:'Toyota', modelo:'Corolla XEi', ano:2022, categoria:'Sedã', preco:124900, custo:108000, status:'Disponível', cadastro:'2026-07-12', venda:'' },
    { id: 'AV-1002', marca:'Honda', modelo:'Civic Touring', ano:2021, categoria:'Sedã', preco:139900, custo:115000, status:'Vendido', cadastro:'2026-06-18', venda:'2026-09-14' },
    { id: 'AV-1003', marca:'Jeep', modelo:'Compass Longitude', ano:2023, categoria:'SUV', preco:158500, custo:141000, status:'Disponível', cadastro:'2026-08-03', venda:'' },
    { id: 'AV-1004', marca:'Volkswagen', modelo:'T-Cross Comfortline', ano:2022, categoria:'SUV', preco:119900, custo:101500, status:'Reservado', cadastro:'2026-08-15', venda:'' },
    { id: 'AV-1005', marca:'Hyundai', modelo:'HB20 Platinum', ano:2024, categoria:'Hatch', preco:91900, custo:76600, status:'Vendido', cadastro:'2026-07-01', venda:'2026-08-22' },
    { id: 'AV-1006', marca:'Fiat', modelo:'Pulse Audace', ano:2023, categoria:'SUV', preco:105900, custo:90800, status:'Disponível', cadastro:'2026-08-22', venda:'' },
    { id: 'AV-1007', marca:'Chevrolet', modelo:'Onix Premier', ano:2022, categoria:'Hatch', preco:85900, custo:70900, status:'Disponível', cadastro:'2026-07-29', venda:'' },
    { id: 'AV-1008', marca:'Nissan', modelo:'Kicks Exclusive', ano:2023, categoria:'SUV', preco:129900, custo:110000, status:'Vendido', cadastro:'2026-07-09', venda:'2026-10-05' },
    { id: 'AV-1009', marca:'Renault', modelo:'Duster Iconic', ano:2021, categoria:'SUV', preco:94900, custo:81300, status:'Disponível', cadastro:'2026-09-04', venda:'' },
    { id: 'AV-1010', marca:'Toyota', modelo:'Hilux SRX', ano:2022, categoria:'Picape', preco:249900, custo:216000, status:'Reservado', cadastro:'2026-08-19', venda:'' },
    { id: 'AV-1011', marca:'Volkswagen', modelo:'Polo Highline', ano:2024, categoria:'Hatch', preco:104900, custo:88900, status:'Vendido', cadastro:'2026-06-25', venda:'2026-07-30' },
    { id: 'AV-1012', marca:'Chevrolet', modelo:'Tracker LTZ', ano:2023, categoria:'SUV', preco:132900, custo:111000, status:'Disponível', cadastro:'2026-09-01', venda:'' },
    { id: 'AV-1013', marca:'Toyota', modelo:'Corolla Cross XRE', ano:2022, categoria:'SUV', preco:158900, custo:139200, status:'Disponível', cadastro:'2026-08-12', venda:'' },
    { id: 'AV-1014', marca:'Honda', modelo:'HR-V EX', ano:2022, categoria:'SUV', preco:127900, custo:112500, status:'Disponível', cadastro:'2026-09-03', venda:'' },
    { id: 'AV-1015', marca:'Jeep', modelo:'Renegade Longitude', ano:2022, categoria:'SUV', preco:112900, custo:98700, status:'Disponível', cadastro:'2026-08-25', venda:'' },
    { id: 'AV-1016', marca:'Hyundai', modelo:'Creta Plus', ano:2022, categoria:'SUV', preco:114900, custo:99500, status:'Disponível', cadastro:'2026-09-14', venda:'' },
    { id: 'AV-1017', marca:'Fiat', modelo:'Argo Drive', ano:2022, categoria:'Hatch', preco:73900, custo:62600, status:'Disponível', cadastro:'2026-09-11', venda:'' },
    { id: 'AV-1018', marca:'Fiat', modelo:'Mobi Trekking', ano:2022, categoria:'Hatch', preco:60900, custo:51400, status:'Disponível', cadastro:'2026-10-01', venda:'' },
    { id: 'AV-1019', marca:'Renault', modelo:'Kwid Outsider', ano:2022, categoria:'Hatch', preco:58900, custo:48800, status:'Disponível', cadastro:'2026-10-03', venda:'' },
    { id: 'AV-1020', marca:'Fiat', modelo:'Strada Endurance', ano:2023, categoria:'Picape', preco:99900, custo:85200, status:'Disponível', cadastro:'2026-09-30', venda:'' },
    { id: 'AV-1021', marca:'Fiat', modelo:'Toro Volcano', ano:2022, categoria:'Picape', preco:148900, custo:129500, status:'Reservado', cadastro:'2026-07-22', venda:'' },
    { id: 'AV-1022', marca:'Chevrolet', modelo:'Montana LTZ', ano:2023, categoria:'Picape', preco:126900, custo:112400, status:'Disponível', cadastro:'2026-09-19', venda:'' },
    { id: 'AV-1023', marca:'Fiat', modelo:'Cronos Drive', ano:2022, categoria:'Sedã', preco:81900, custo:70500, status:'Vendido', cadastro:'2026-07-01', venda:'2026-09-16' },
    { id: 'AV-1024', marca:'Peugeot', modelo:'208 Active', ano:2022, categoria:'Hatch', preco:76900, custo:66900, status:'Vendido', cadastro:'2026-07-18', venda:'2026-10-11' }
  ];
  const round = n => Math.round((n + Number.EPSILON) * 100) / 100;
  function number(value) { const n = Number(value); return Number.isFinite(n) ? n : 0; }
  function normalizeVehicle(item) {
    const v = {
      id: String(item.id || '').trim(), marca: String(item.marca || '').trim(), modelo: String(item.modelo || '').trim(),
      ano: Number(item.ano), categoria: String(item.categoria || 'Outros').trim(), preco: number(item.preco),
      custo: number(item.custo), status: String(item.status || 'Disponível').trim(),
      cadastro: String(item.cadastro || '').trim(), venda: String(item.venda || '').trim()
    };
    if (!v.id || !v.marca || !v.modelo) throw new Error('ID, marca e modelo são obrigatórios.');
    if (!Number.isInteger(v.ano) || v.ano < 1950 || v.ano > 2100) throw new Error('Ano do veículo inválido.');
    if (!STATUS.includes(v.status)) throw new Error('Situação do veículo inválida.');
    if (v.preco < 0 || v.custo < 0 || !Number.isFinite(v.preco) || !Number.isFinite(v.custo)) throw new Error('Preço e custo devem ser positivos.');
    if (v.status !== 'Vendido') v.venda = '';
    return v;
  }
  const LEGACY_DEMO_IDS = new Set(DEMO.slice(0,12).map(v=>v.id));
  const CATEGORY_LOOKUP = new Map(DEMO.map(v=>[v.marca.toLowerCase()+'|'+v.modelo.toLowerCase(),v.categoria]));
  function categoryFor(item) {
    const key=String(item.marca||'').trim().toLowerCase()+'|'+String(item.modelo||'').trim().toLowerCase();
    return CATEGORY_LOOKUP.get(key) || item.categoria || 'Outros';
  }
  function mergeLegacyDemo(saved) {
    if(!Array.isArray(saved)) return DEMO.map(x=>({...x}));
    const original=saved.map(v=>({...normalizeVehicle(v),imagem_url:v.imagem_url||''}));
    // Expand only the old 12-vehicle fictitious inventory; never append demo cars to an imported custom CSV.
    if(original.length===0 || original.length>12 || !original.every(v=>LEGACY_DEMO_IDS.has(v.id))) return original;
    return [...original,...DEMO.slice(12).map(v=>({...v}))];
  }
  function loadDemoInventory(storage) {
    try {
      const raw=storage.getItem('autostock-analytics-v1');
      if(!raw) return DEMO.map(v=>({...v}));
      const saved=JSON.parse(raw);
      const updated=mergeLegacyDemo(saved);
      if(Array.isArray(saved) && updated.length>saved.length) storage.setItem('autostock-analytics-v1',JSON.stringify(updated));
      return updated;
    }catch(e){return DEMO.map(v=>({...v}));}
  }
  function metrics(items) {
    const available = items.filter(v => v.status === 'Disponível');
    const reserved = items.filter(v => v.status === 'Reservado');
    const sold = items.filter(v => v.status === 'Vendido');
    const stock = items.filter(v => v.status !== 'Vendido');
    const sum = (list, k) => round(list.reduce((acc, v) => acc + number(v[k]), 0));
    const receita = sum(sold, 'preco');
    const custoVendido = sum(sold, 'custo');
    return {
      total: items.length, disponiveis: available.length, reservados: reserved.length, vendidos: sold.length,
      capitalEstoque: sum(stock, 'custo'), potencialVenda: sum(stock, 'preco'),
      receita, custoVendido, lucroBruto: round(receita - custoVendido),
      margemBruta: receita ? round((receita - custoVendido) / receita * 100) : 0,
      ticketMedio: sold.length ? round(receita / sold.length) : 0
    };
  }
  function byMonth(items) {
    const out = {};
    for (const v of items) if (v.status === 'Vendido' && /^\d{4}-\d{2}-\d{2}$/.test(v.venda)) {
      const month = v.venda.slice(0, 7);
      out[month] = round((out[month] || 0) + v.preco);
    }
    return Object.entries(out).sort(([a],[b])=>a.localeCompare(b)).map(([mes, receita])=>({mes, receita}));
  }
  function parseCSV(text) {
    const rows=[]; let row=[], field='', inQuotes=false;
    text = text.replace(/^\uFEFF/, '');
    for (let i=0; i<text.length; i++) {
      const c=text[i];
      if (inQuotes && c==='"' && text[i+1]==='"') {field+='"';i++;}
      else if (c==='"') inQuotes=!inQuotes;
      else if (!inQuotes && c===';') {row.push(field);field='';}
      else if (!inQuotes && (c==='\n'||c==='\r')) {if(c==='\r' && text[i+1]==='\n')i++;row.push(field);if(row.some(x=>x.trim()))rows.push(row);row=[];field='';}
      else field+=c;
    }
    if(inQuotes)throw new Error('CSV com aspas não fechadas.');
    row.push(field);if(row.some(x=>x.trim()))rows.push(row);
    if (rows.length<2) throw new Error('CSV sem registros.');
    const header=rows.shift().map(x=>x.trim().toLowerCase());
    const required=['id','marca','modelo','ano','categoria','preco','custo','status','cadastro','venda'];
    if(required.some(k=>!header.includes(k))) throw new Error('Colunas esperadas: '+required.join(', '));
    const seen=new Set();
    return rows.map((cols,index)=>{
      if(cols.length!==header.length) throw new Error(`Colunas inconsistentes na linha ${index+2}.`);
      const raw=Object.fromEntries(header.map((k,i)=>[k,cols[i]]));
      for(const key of ['preco','custo']) {
        const val=String(raw[key]).trim();
        raw[key]=val.includes(',') ? val.replace(/\./g,'').replace(',','.') : val;
      }
      const v=normalizeVehicle(raw);
      if (seen.has(v.id)) throw new Error('ID duplicado: '+v.id);
      seen.add(v.id);return v;
    });
  }
  function toCSV(items) {
    const header=['id','marca','modelo','ano','categoria','preco','custo','status','cadastro','venda'];
    const quote = val => '"'+String(val??'').replace(/"/g,'""')+'"';
    return '\uFEFF'+header.join(';')+'\r\n'+items.map(v=>header.map(k=>quote(v[k])).join(';')).join('\r\n');
  }
  function escapeHTML(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  return {STATUS, DEMO, categoryFor, mergeLegacyDemo, loadDemoInventory, metrics, byMonth, normalizeVehicle, parseCSV, toCSV, escapeHTML};
});
