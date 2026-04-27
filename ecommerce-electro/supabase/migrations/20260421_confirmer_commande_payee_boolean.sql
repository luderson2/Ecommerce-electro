-- Retourne true si la commande vient d'être confirmée, false si elle était déjà payée.
-- Permet au code appelant de ne pas renvoyer l'email de confirmation sur un retry.
create or replace function public.confirmer_commande_payee(
  p_order_id uuid,
  p_stripe_session_id text,
  p_payment_intent_id text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_item record;
begin
  select id, status, stripe_session_id
  into v_order
  from orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Commande introuvable';
  end if;

  if v_order.stripe_session_id is distinct from p_stripe_session_id then
    raise exception 'Session Stripe invalide';
  end if;

  if v_order.status = 'payee' then
    return false;
  end if;

  if v_order.status <> 'en_attente' then
    raise exception 'Statut de commande invalide';
  end if;

  for v_item in
    select product_id, quantity
    from order_items
    where order_id = p_order_id
  loop
    update products
    set stock = stock - v_item.quantity
    where id = v_item.product_id
      and stock >= v_item.quantity;

    if not found then
      raise exception 'Stock insuffisant pour le produit %', v_item.product_id;
    end if;
  end loop;

  update orders
  set
    status = 'payee',
    stripe_payment_id = p_payment_intent_id,
    stripe_payment_intent_id = p_payment_intent_id
  where id = p_order_id;

  return true;
end;
$$;

revoke all on function public.confirmer_commande_payee(uuid, text, text) from public, anon, authenticated;
