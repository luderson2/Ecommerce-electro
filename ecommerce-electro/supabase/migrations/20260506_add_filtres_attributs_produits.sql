-- Ajout de 3 attributs filtrables au catalogue
-- - washer_type : laveuses/sécheuses (régulière vs frontale)
-- - stove_type  : cuisinières (céramique vs serpentin)
-- - finish      : finition générale (stainless, blanc, noir)

alter table public.products
  add column if not exists washer_type text,
  add column if not exists stove_type text,
  add column if not exists finish text;

alter table public.products
  drop constraint if exists products_washer_type_check,
  drop constraint if exists products_stove_type_check,
  drop constraint if exists products_finish_check;

alter table public.products
  add constraint products_washer_type_check
    check (washer_type is null or washer_type in ('reguliere', 'frontale')),
  add constraint products_stove_type_check
    check (stove_type is null or stove_type in ('ceramique', 'serpentin')),
  add constraint products_finish_check
    check (finish is null or finish in ('stainless', 'blanc', 'noir'));

create index if not exists products_washer_type_idx on public.products (washer_type) where washer_type is not null;
create index if not exists products_stove_type_idx  on public.products (stove_type)  where stove_type  is not null;
create index if not exists products_finish_idx      on public.products (finish)      where finish      is not null;

-- Backfill basé sur les noms existants
update public.products set finish = 'stainless'
  where finish is null and (name ilike '%acier inox%' or name ilike '%stainless%');
update public.products set finish = 'noir'
  where finish is null and name ilike '% noir%';
update public.products set finish = 'blanc'
  where finish is null and name ilike '% blanc%';

update public.products set washer_type = 'frontale'
  where washer_type is null and name ilike '%frontal%';
update public.products set washer_type = 'reguliere'
  where washer_type is null and name ilike '%agitateur%';

update public.products set stove_type = 'ceramique'
  where stove_type is null and (name ilike '%vitroceramique%' or name ilike '%vitrocéramique%' or name ilike '%ceramique%' or name ilike '%céramique%');
update public.products set stove_type = 'serpentin'
  where stove_type is null and name ilike '%serpentin%';
