/* Sessões reais via Supabase Auth + RLS; demonstração NÃO é autenticação. */
(() => {
  'use strict';
  const DEMO_KEY = 'autostock-demo-role';
  const config = window.AutoStockConfig || {};
  const configured = /^https:\/\/[^\s]+\.supabase\.co\/?$/.test(config.supabaseUrl||'') && Boolean(config.supabaseAnonKey);
  let client = null;
  let setup;
  const loadSDK = () => new Promise((resolve,reject) => {
    if (window.supabase?.createClient) return resolve();
    const s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/dist/umd/supabase.min.js';
    s.onload=resolve;s.onerror=()=>reject(new Error('Não foi possível carregar o serviço de autenticação.'));
    document.head.appendChild(s);
  });
  async function getClient() {
    if (!configured) return null;
    if (!setup) setup=loadSDK().then(()=>{client=window.supabase.createClient(config.supabaseUrl,config.supabaseAnonKey,{auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}});return client;});
    return setup;
  }
  async function roleFor(user) {
    const db=await getClient();
    const {data,error}=await db.from('profiles').select('role').eq('id',user.id).single();
    if(error || !['admin','cliente'].includes(data?.role)) throw new Error('Perfil não encontrado. Confirme a criação das tabelas e o acesso da conta.');
    return data.role;
  }
  async function current() {
    const demo=sessionStorage.getItem(DEMO_KEY);
    if(demo==='admin'||demo==='cliente')return {mode:'demo',role:demo,user:null,client:null};
    if(!configured)return {mode:'unconfigured',role:null,user:null,client:null};
    const db=await getClient();
    const {data,error}=await db.auth.getUser();
    if(error || !data.user)return {mode:'unauthenticated',role:null,user:null,client:db};
    const role=await roleFor(data.user);
    return {mode:'supabase',role,user:data.user,client:db};
  }
  async function guard(role) {
    try {
      const ctx=await current();
      if(ctx.role!==role) {window.location.replace(ctx.role==='admin'?'admin.html':ctx.role==='cliente'?'cliente.html':'index.html#acessos');return null;}
      document.documentElement.classList.remove('auth-pending');
      document.querySelectorAll('[data-auth-mode]').forEach(node=>node.textContent=ctx.mode==='demo'?'DEMONSTRAÇÃO · DADOS FICTÍCIOS':'ACESSO AUTENTICADO');
      const demoBadge=document.querySelector('[data-demo-warning]');if(demoBadge)demoBadge.hidden=ctx.mode!=='demo';
      return ctx;
    }catch(e){console.error('Falha na verificação de acesso:',e);document.body.innerHTML='<main style="font:16px system-ui;color:#fff;background:#101d35;padding:50px;min-height:100vh"><h1>Não foi possível validar seu acesso</h1><p>'+String(e.message).replace(/[<>&]/g,'')+'</p><a style="color:#ffcb79" href="index.html">Voltar ao portal</a></main>';document.documentElement.classList.remove('auth-pending');return null;}
  }
  function demo(role){if(!['admin','cliente'].includes(role))throw new Error('Perfil inválido');sessionStorage.setItem(DEMO_KEY,role);window.location.href=role==='admin'?'admin.html':'cliente.html';}
  async function login(email,password) {
    if(!configured)throw new Error('O login real ainda não foi configurado. Use o modo demonstração para conhecer os portais.');
    sessionStorage.removeItem(DEMO_KEY);
    const db=await getClient();
    const {data,error}=await db.auth.signInWithPassword({email,password});
    if(error)throw new Error('E-mail ou senha incorretos, ou conta ainda não confirmada.');
    const role=await roleFor(data.user);
    return role;
  }
  async function signup(name,email,password) {
    if(!configured)throw new Error('Cadastro real indisponível até a configuração do Supabase.');
    const db=await getClient();
    const {data,error}=await db.auth.signUp({email,password,options:{data:{full_name:name}}});
    if(error)throw new Error(error.message);
    return data;
  }
  async function resetPassword(email) {
    if(!configured)throw new Error('Recuperação de senha indisponível no modo demonstração.');
    const db=await getClient();const {error}=await db.auth.resetPasswordForEmail(email,{redirectTo:new URL('index.html',location.href).href});if(error)throw new Error(error.message);
  }
  async function logout(){sessionStorage.removeItem(DEMO_KEY);try{if(configured){const db=await getClient();await db.auth.signOut();}}finally{location.replace('index.html');}}
  window.AutoAuth={configured,getClient,current,guard,demo,login,signup,resetPassword,logout};
})();
