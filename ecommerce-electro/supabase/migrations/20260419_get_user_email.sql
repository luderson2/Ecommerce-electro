-- Securise la RPC get_user_email :
--  * SECURITY DEFINER + search_path fige
--  * Check de role : seul le proprietaire OU un admin/employee peut lire un email
--  * service_role (webhook Stripe, envoi email Resend) garde l'acces
--  * anon revoquee explicitement
create or replace function public.get_user_email(user_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid := auth.uid();
  v_is_admin boolean;
  v_email text;
begin
  -- Permettre au service_role (pas d'auth.uid) mais bloquer tout autre appel anonyme
  if v_caller is null and current_setting('request.jwt.role', true) <> 'service_role' then
    raise exception 'Non autorise';
  end if;

  if v_caller is not null then
    select exists (
      select 1 from profiles
      where id = v_caller
        and role in ('admin', 'employee')
    ) into v_is_admin;

    if v_caller <> user_id and not coalesce(v_is_admin, false) then
      raise exception 'Acces refuse';
    end if;
  end if;

  select email into v_email from auth.users where id = user_id;
  return v_email;
end;
$$;

revoke all on function public.get_user_email(uuid) from public, anon;
grant execute on function public.get_user_email(uuid) to authenticated, service_role;
