const test=require('node:test');const assert=require('node:assert/strict');
const core=require('../assets/core.js');const photos=require('../assets/vehicle-photos.js');
test('12 modelos demonstrativos têm fotos de referência diferentes',()=>{const r=core.DEMO.map(v=>photos.resolve(v));assert.equal(r.length,12);assert.ok(r.every(x=>x.kind==='reference'));assert.equal(new Set(r.map(x=>x.url)).size,12);});
test('foto cadastrada tem prioridade',()=>{const r=photos.resolve({...core.DEMO[0],imagem_url:'https://example.com/carro.jpg'});assert.equal(r.url,'https://example.com/carro.jpg');assert.equal(r.kind,'custom');});
test('modelo não conhecido não recebe foto de outro carro',()=>{const r=photos.resolve({marca:'Toyota',modelo:'Corolla Cross',ano:2025});assert.equal(r.kind,'missing');assert.match(r.url,/sem-foto.svg$/);});
test('veículo novo sem imagem verificada recebe placeholder',()=>assert.equal(photos.resolve({marca:'Chevrolet',modelo:'Camaro',ano:2023}).kind,'missing'));
test('fonte e crédito são preservados',()=>{const r=photos.resolve(core.DEMO[0]);assert.match(r.source,/commons.wikimedia.org/);assert.ok(r.credit&&r.license);});
test('pesquisa assistida é restrita a Wikimedia Commons',()=>assert.match(photos.searchUrl(core.DEMO[0]),/^https:\/\/commons.wikimedia.org\//));
