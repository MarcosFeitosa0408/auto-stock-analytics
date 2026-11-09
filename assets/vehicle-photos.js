/* Fotografias por modelo obtidas do Wikimedia Commons: apenas referências. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.AutoStockPhotos=api;
})(typeof window!=='undefined'?window:null,function(){
  'use strict';
  const REGISTRY=[
  {
    "marca": "Toyota",
    "modelo": "Corolla XEi",
    "ano": 2022,
    "arquivo": "Toyota Corolla E210 sedan Shishi 02 2022-06-13.jpg",
    "descricao": "Toyota Corolla E210, 2022",
    "autor": "JamesYoung8167",
    "licenca": "CC BY-SA 4.0"
  },
  {
    "marca": "Honda",
    "modelo": "Civic Touring",
    "ano": 2021,
    "arquivo": "2019-2021HondaCivicSedan.jpg",
    "descricao": "Honda Civic sedã, 2019–2021",
    "autor": "Bull-Doser",
    "licenca": "Domínio público"
  },
  {
    "marca": "Jeep",
    "modelo": "Compass Longitude",
    "ano": 2023,
    "arquivo": "Jeep Compass 1.5 GSE 48V e-Hybrid (2023) (53365186161).jpg",
    "descricao": "Jeep Compass e-Hybrid, 2023",
    "autor": "Charles",
    "licenca": "CC BY 2.0"
  },
  {
    "marca": "Volkswagen",
    "modelo": "T-Cross Comfortline",
    "ano": 2022,
    "arquivo": "Volkswagen T-Cross 1.6 MSi Comfortline 2019 (Chile).jpg",
    "descricao": "Volkswagen T-Cross Comfortline, 2019",
    "autor": "RL GNZLZ",
    "licenca": "CC BY-SA 2.0"
  },
  {
    "marca": "Hyundai",
    "modelo": "HB20 Platinum",
    "ano": 2024,
    "arquivo": "2023 Hyundai HB20 1.0 T-GDi Platinum Plus (Brazil) front view.png",
    "descricao": "Hyundai HB20 Platinum Plus, 2023",
    "autor": "Autosdeprimera",
    "licenca": "CC BY 3.0"
  },
  {
    "marca": "Fiat",
    "modelo": "Pulse Audace",
    "ano": 2023,
    "arquivo": "2024 Fiat Pulse 1.0 Turbo 200 Audace (front).jpg",
    "descricao": "Fiat Pulse Audace, 2024",
    "autor": "Just a Man",
    "licenca": "CC BY 4.0"
  },
  {
    "marca": "Chevrolet",
    "modelo": "Onix Premier",
    "ano": 2022,
    "arquivo": "2022 Chevrolet Onix 1.2 LT hatchback.jpg",
    "descricao": "Chevrolet Onix LT hatchback, 2022",
    "autor": "Just a Man",
    "licenca": "CC BY 4.0"
  },
  {
    "marca": "Nissan",
    "modelo": "Kicks Exclusive",
    "ano": 2023,
    "arquivo": "2021 Nissan Kicks SV (facelift), front 11.6.21.jpg",
    "descricao": "Nissan Kicks SV facelift, 2021",
    "autor": "Kevauto",
    "licenca": "CC BY-SA 4.0"
  },
  {
    "marca": "Renault",
    "modelo": "Duster Iconic",
    "ano": 2021,
    "arquivo": "Renault Duster (51658579574).jpg",
    "descricao": "Renault Duster, foto de 2021",
    "autor": "Abdulla Al Muhairi",
    "licenca": "CC0 1.0"
  },
  {
    "marca": "Toyota",
    "modelo": "Hilux SRX",
    "ano": 2022,
    "arquivo": "Toyota Hilux 2022.jpg",
    "descricao": "Toyota Hilux, 2022",
    "autor": "الدعوة السلفية في السعودية 2025",
    "licenca": "CC BY-SA 4.0"
  },
  {
    "marca": "Volkswagen",
    "modelo": "Polo Highline",
    "ano": 2024,
    "arquivo": "2024 Volkswagen Polo 1.6 MSi Highline AT (Brazil).jpg",
    "descricao": "Volkswagen Polo Highline, 2024",
    "autor": "Just a Man",
    "licenca": "CC BY 4.0"
  },
  {
    "marca": "Chevrolet",
    "modelo": "Tracker LTZ",
    "ano": 2023,
    "arquivo": "2023 Chevrolet Tracker 1.2 Premier.jpg",
    "descricao": "Chevrolet Tracker Premier, 2023",
    "autor": "Maxi-Napo-99",
    "licenca": "CC BY 4.0"
  },
  {"marca":"Toyota","modelo":"Corolla Cross XRE","ano":2022,"arquivo":"Toyota Corolla Cross 2.0 SEG 2022 (52601788623).jpg","descricao":"Toyota Corolla Cross SEG, 2022 (Brasil/América do Sul)","autor":"RL GNZLZ","licenca":"CC BY-SA 2.0"},
  {"marca":"Honda","modelo":"HR-V EX","ano":2022,"arquivo":"2022 Honda HR-V 1.8 EX (Brazil).jpg","descricao":"Honda HR-V EX, 2022 (Brasil)","autor":"Just a Man","licenca":"CC BY 4.0"},
  {"marca":"Jeep","modelo":"Renegade Longitude","ano":2022,"arquivo":"2022 Jeep Renegade.jpg","descricao":"Jeep Renegade, 2022 (outra versão)","autor":"Calreyn88","licenca":"CC BY-SA 4.0"},
  {"marca":"Hyundai","modelo":"Creta Plus","ano":2022,"arquivo":"2022 Hyundai Creta 1.6 Plus.jpg","descricao":"Hyundai Creta Plus, 2022 (Chile/outra configuração)","autor":"RL GNZLZ","licenca":"CC BY-SA 2.0"},
  {"marca":"Fiat","modelo":"Argo Drive","ano":2022,"arquivo":"Frente Fiat Argo 1.0 2022.jpg","descricao":"Fiat Argo 1.0, 2022 (Brasil)","autor":"Arthur RPereira","licenca":"CC0 1.0"},
  {"marca":"Fiat","modelo":"Mobi Trekking","ano":2022,"arquivo":"2022 Fiat Mobi 1.0 Trekking.jpg","descricao":"Fiat Mobi Trekking, 2022","autor":"RL GNZLZ","licenca":"CC BY-SA 2.0"},
  {"marca":"Renault","modelo":"Kwid Outsider","ano":2022,"arquivo":"Renault Kwid 1.0 Outsider 2022.jpg","descricao":"Renault Kwid Outsider, 2022","autor":"RL GNZLZ","licenca":"CC BY-SA 2.0"},
  {"marca":"Fiat","modelo":"Strada Endurance","ano":2023,"arquivo":"2023 Fiat Strada 1.4 Fire Endurance.jpg","descricao":"Fiat Strada Endurance, 2023","autor":"Maxi-Napo-99","licenca":"CC BY 4.0"},
  {"marca":"Fiat","modelo":"Toro Volcano","ano":2022,"arquivo":"2022 Fiat Toro 2.0 Multijet Volcano.jpg","descricao":"Fiat Toro Volcano, 2022","autor":"Just a Man","licenca":"CC BY 4.0"},
  {"marca":"Chevrolet","modelo":"Montana LTZ","ano":2023,"arquivo":"2023 Chevrolet Montana LTZ front.jpg","descricao":"Chevrolet Montana LTZ, 2023","autor":"Maxi-Napo-99","licenca":"CC BY-SA 4.0"},
  {"marca":"Fiat","modelo":"Cronos Drive","ano":2022,"arquivo":"2022 Fiat Cronos 1.3 Drive GSE (front view).jpg","descricao":"Fiat Cronos Drive, 2022","autor":"Just a Man","licenca":"CC BY 4.0"},
  {"marca":"Peugeot","modelo":"208 Active","ano":2022,"arquivo":"2022 Peugeot 208 1.6 Active.jpg","descricao":"Peugeot 208 Active, 2022","autor":"Maxi-Napo-99","licenca":"CC BY 4.0"}
];
  const PLACEHOLDER='assets/photos/sem-foto.svg';
  const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  function resolve(vehicle){
    const own=String(vehicle?.imagem_url||'').trim();
    if(/^https:\/\/[^\s<>"']+$/i.test(own))return {kind:'custom',url:own,caption:'Foto informada pelo anunciante',source:null};
    const make=norm(vehicle?.marca),model=norm(vehicle?.modelo),year=Number(vehicle?.ano);
    const item=REGISTRY.find(x=>norm(x.marca)===make && (model===norm(x.modelo)||model.startsWith(norm(x.modelo)+' ')) && (!Number.isFinite(year)||Math.abs(year-x.ano)<=4));
    if(!item)return {kind:'missing',url:PLACEHOLDER,caption:'Foto não cadastrada para este modelo',source:null};
    const file=encodeURIComponent(item.arquivo.replace(/ /g,'_'));
    return {kind:'reference',url:'https://commons.wikimedia.org/wiki/Special:FilePath/'+file+'?width=900',source:'https://commons.wikimedia.org/wiki/File:'+file,caption:'Foto de referência: '+item.descricao+'. Ano, versão e cor podem variar.',description:item.descricao,credit:item.autor,license:item.licenca};
  }
  function searchUrl(vehicle){
    const query=[vehicle?.marca,vehicle?.modelo,vehicle?.ano].filter(Boolean).join(' ');
    return 'https://commons.wikimedia.org/w/index.php?title=Special:MediaSearch&type=image&search='+encodeURIComponent(query);
  }
  return {resolve,searchUrl,REGISTRY,PLACEHOLDER};
});
