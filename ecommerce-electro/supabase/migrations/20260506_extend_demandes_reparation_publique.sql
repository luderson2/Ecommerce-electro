-- Ajout des champs pour le formulaire public enrichi
-- Toutes nullable pour rétro-compat avec les lignes existantes
alter table public.demandes_reparation
  add column if not exists prenom text,
  add column if not exists email text,
  add column if not exists type_appareil text,
  add column if not exists marque text,
  add column if not exists modele text,
  add column if not exists disponibilites text;

alter table public.demandes_reparation
  drop constraint if exists demandes_reparation_email_format_check;
alter table public.demandes_reparation
  add constraint demandes_reparation_email_format_check
  check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

create index if not exists demandes_reparation_email_idx
  on public.demandes_reparation (email)
  where email is not null;
