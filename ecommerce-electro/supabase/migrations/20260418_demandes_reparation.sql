create table if not exists public.demandes_reparation (
  id uuid primary key default gen_random_uuid(),
  nom text not null check (char_length(trim(nom)) between 2 and 100),
  telephone text not null check (telephone ~ '^\+?1?\d{10}$'),
  appareil text not null check (char_length(trim(appareil)) between 2 and 120),
  description text not null check (char_length(trim(description)) between 10 and 2000),
  statut text not null default 'nouveau'
    check (statut in ('nouveau', 'contacte', 'en_cours', 'termine', 'annule')),
  ip_hash text,
  user_agent text,
  notes_admin text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists demandes_reparation_statut_created_idx
  on public.demandes_reparation (statut, created_at desc);

create index if not exists demandes_reparation_ip_hash_recent_idx
  on public.demandes_reparation (ip_hash, created_at desc);

alter table public.demandes_reparation enable row level security;

revoke all on public.demandes_reparation from anon, authenticated;

create or replace function public.tg_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_demandes_reparation_updated_at on public.demandes_reparation;

create trigger trg_demandes_reparation_updated_at
  before update on public.demandes_reparation
  for each row execute function public.tg_touch_updated_at();
