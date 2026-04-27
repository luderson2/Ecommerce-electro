-- Table de déduplication pour les événements webhook Stripe.
-- Empêche qu'un même event.id soit traité plusieurs fois (retry Stripe, replay attack).

create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists stripe_webhook_events_received_at_idx
  on public.stripe_webhook_events (received_at desc);

alter table public.stripe_webhook_events enable row level security;

-- Seul le service_role (via lib/supabase/admin.ts dans le webhook) y accède.
revoke all on public.stripe_webhook_events from anon, authenticated;
