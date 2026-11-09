-- AutoStock Analytics | execute no SQL Editor do seu projeto Supabase.
-- Não adicione senha de administrador nem chave service_role no repositório.
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 role text not null default 'cliente' check (role in ('cliente','admin')),
 full_name text not null default '',
 created_at timestamptz not null default now()
);

create or replace function public.bootstrap_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
 insert into public.profiles (id,role,full_name)
 values (new.id,'cliente',left(coalesce(new.raw_user_meta_data->>'full_name',''),100))
 on conflict (id) do nothing;
 return new;
end;
$$;
drop trigger if exists on_autostock_user_created on auth.users;
create trigger on_autostock_user_created after insert on auth.users
for each row execute function public.bootstrap_profile();

-- Identidade do usuário é obtida do JWT; nunca do formulário da página.
create or replace function public.autostock_is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;
revoke all on function public.autostock_is_admin() from public,anon;
grant execute on function public.autostock_is_admin() to authenticated;

create table if not exists public.vehicles (
 id text primary key, marca text not null, modelo text not null,
 ano integer not null check (ano between 1950 and 2100),
 categoria text not null, preco numeric(14,2) not null check (preco >= 0),
 custo numeric(14,2) not null check (custo >= 0),
 status text not null default 'Disponível' check (status in ('Disponível','Reservado','Vendido')),
 cadastro date not null default current_date, venda date,
 imagem_url text,
 created_at timestamptz not null default now()
);

create table if not exists public.pedidos (
 id bigint generated always as identity primary key,
 cliente_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 veiculo_id text not null references public.vehicles(id) on delete restrict,
 status text not null default 'Pendente' check (status in ('Pendente','Em negociação','Concluído','Cancelado')),
 created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.pedidos enable row level security;

-- Policies criadas de forma idempotente.
drop policy if exists "profiles_read_own_or_admin" on public.profiles;
create policy "profiles_read_own_or_admin" on public.profiles for select to authenticated
using ((select auth.uid())=id or (select public.autostock_is_admin()));
-- Não existe policy de INSERT/UPDATE público para profiles; apenas trigger interno ou operação no SQL Editor.

drop policy if exists "vehicles_admin_all" on public.vehicles;
create policy "vehicles_admin_all" on public.vehicles for all to authenticated
using ((select public.autostock_is_admin()))
with check ((select public.autostock_is_admin()));

drop policy if exists "orders_read_own_or_admin" on public.pedidos;
create policy "orders_read_own_or_admin" on public.pedidos for select to authenticated
using ((select auth.uid()) = cliente_id or (select public.autostock_is_admin()));
-- Função de catálogo não expõe custos nem permite consultar a tabela privada.
create or replace function public.autostock_vehicle_available(v_id text)
returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.vehicles v where v.id=v_id and v.status='Disponível');
$$;
revoke all on function public.autostock_vehicle_available(text) from public,anon;
grant execute on function public.autostock_vehicle_available(text) to authenticated;
drop policy if exists "orders_create_own" on public.pedidos;
create policy "orders_create_own" on public.pedidos for insert to authenticated
with check ((select auth.uid()) = cliente_id and status='Pendente' and (select public.autostock_vehicle_available(veiculo_id)));

drop policy if exists "orders_update_admin" on public.pedidos;
create policy "orders_update_admin" on public.pedidos for update to authenticated
using ((select public.autostock_is_admin()))
with check ((select public.autostock_is_admin()));

-- View somente com informações públicas de veículos DISPONÍVEIS.
-- SECURITY DEFINER intencional para permitir catálogo sem expor 'custo'.
create or replace view public.catalogo_veiculos with (security_barrier=true) as
select id, marca, modelo, ano, categoria, preco, status, imagem_url
from public.vehicles where status='Disponível';
revoke all on public.vehicles from anon;
revoke all on public.vehicles from authenticated;
grant select,insert,update,delete on public.vehicles to authenticated; -- RLS restringe ao admin
revoke all on public.catalogo_veiculos from public,anon;
grant select on public.catalogo_veiculos to authenticated;
revoke all on public.profiles from anon;
grant select on public.profiles to authenticated;
revoke all on public.pedidos from anon;
grant select,insert,update on public.pedidos to authenticated;
grant usage,select on all sequences in schema public to authenticated;

-- Transação atômica: o pedido só é concluído se o veículo estiver disponível.
create or replace function public.autostock_concluir_pedido(p_id bigint)
returns void language plpgsql security definer set search_path = '' as $$
declare v_id text;
begin
 if not public.autostock_is_admin() then raise exception 'Operação exclusiva do administrador'; end if;
 select p.veiculo_id into v_id from public.pedidos p where p.id=p_id and p.status in ('Pendente','Em negociação') for update;
 if v_id is null then raise exception 'Pedido não encontrado ou já encerrado'; end if;
 update public.vehicles set status='Vendido',venda=current_date where id=v_id and status='Disponível';
 if not found then raise exception 'Veículo indisponível. Não foi possível concluir'; end if;
 update public.pedidos set status='Concluído' where id=p_id;
end;
$$;
revoke all on function public.autostock_concluir_pedido(bigint) from public,anon;
grant execute on function public.autostock_concluir_pedido(bigint) to authenticated;

-- ADMINISTRADOR: execute manualmente no SQL Editor após cadastrar o e-mail pelo Auth.
-- Substitua o exemplo abaixo pelo e-mail exato. NÃO faça isso por formulário público.
-- update public.profiles set role='admin'
-- where id=(select id from auth.users where email='admin@seu-dominio.com');
