-- Fonction atomique : remplace tous les produits d'un pack en une seule transaction.
-- Sans cette fonction, le delete + insert dans le client JS n'est pas atomique :
-- si l'insert échoue après le delete, le pack se retrouve sans produits.
create or replace function remplacer_pack_products(
  p_pack_id   uuid,
  p_product_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from profiles
    where id = auth.uid()
      and role in ('admin', 'employee')
  ) then
    raise exception 'Acces non autorise';
  end if;

  delete from pack_products where pack_id = p_pack_id;

  if array_length(p_product_ids, 1) > 0 then
    insert into pack_products (pack_id, product_id)
    select p_pack_id, unnest(p_product_ids);
  end if;
end;
$$;

revoke all on function public.remplacer_pack_products(uuid, uuid[]) from public, anon, authenticated;
grant execute on function public.remplacer_pack_products(uuid, uuid[]) to authenticated;
