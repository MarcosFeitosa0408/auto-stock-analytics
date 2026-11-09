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
    { id: 'AV-1012', marca:'Chevrolet', modelo:'Tracker LTZ', ano:2023, categoria:'SUV', preco:132900, custo:111000, status:'Disponível', cadastro:'2026-09-01', venda:'' }
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
  return {STATUS, DEMO, metrics, byMonth, normalizeVehicle, parseCSV, toCSV, escapeHTML};
});
