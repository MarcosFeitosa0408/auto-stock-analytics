(() => {
  'use strict';
  const auth=window.AutoAuth;
  const dialog=document.getElementById('auth-dialog');
  const form=document.getElementById('auth-form');
  const error=document.getElementById('auth-error');
  const submit=document.getElementById('submit-auth');
  const signupToggle=document.getElementById('toggle-signup');
  const forgot=document.getElementById('forgot-pass');
  let requestedRole='cliente';let signup=false;
  function open(role){requestedRole=role;signup=false;form.reset();error.textContent='';update();dialog.showModal();}
  function update(){document.getElementById('auth-title').textContent=signup?'Criar conta de cliente':requestedRole==='admin'?'Acesso do administrador':'Acesso do cliente';document.getElementById('auth-description').textContent=signup?'Cadastre seu e-mail para solicitar informações sobre veículos.':'Entre com o e-mail e a senha da sua conta.';document.getElementById('name-row').hidden=!signup;document.getElementById('auth-name').required=signup;signupToggle.hidden=requestedRole==='admin';signupToggle.textContent=signup?'Já tenho conta · Entrar':'Criar conta de cliente';submit.textContent=signup?'Criar conta':'Entrar';forgot.hidden=signup;}
  document.querySelectorAll('[data-open-auth]').forEach(el=>el.addEventListener('click',()=>open(el.dataset.openAuth)));
  document.querySelectorAll('[data-demo]').forEach(el=>el.addEventListener('click',()=>auth.demo(el.dataset.demo)));
  document.getElementById('close-auth').addEventListener('click',()=>dialog.close());
  signupToggle.addEventListener('click',()=>{signup=!signup;error.textContent='';update();});
  forgot.addEventListener('click',async()=>{const email=form.elements.email.value.trim();if(!email){error.textContent='Informe seu e-mail para receber o link de recuperação.';return;}try{await auth.resetPassword(email);error.style.color='#a6f1c8';error.textContent='Se o endereço estiver cadastrado, enviaremos instruções.';}catch(e){error.style.color='#ffadad';error.textContent=e.message;}});
  form.addEventListener('submit',async e=>{e.preventDefault();error.style.color='#ffadad';error.textContent='';submit.disabled=true;submit.textContent='Aguarde…';try{const email=form.elements.email.value.trim();const password=form.elements.password.value;if(signup){await auth.signup(form.elements.name.value.trim(),email,password);error.style.color='#a6f1c8';error.textContent='Cadastro recebido. Confirme seu e-mail, se solicitado, e depois entre.';signup=false;update();}else{const role=await auth.login(email,password);if(role!==requestedRole){error.textContent='Esta conta tem perfil '+(role==='admin'?'administrador':'cliente')+'. Redirecionando para a área correta.';}location.href=role==='admin'?'admin.html':'cliente.html';}}catch(ex){error.textContent=ex.message;}finally{submit.disabled=false;submit.textContent=signup?'Criar conta':'Entrar';}});
})();
