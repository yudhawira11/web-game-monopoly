create table if not exists public.rooms (
  code text primary key,
  status text not null,
  state jsonb not null,
  updated_at timestamptz default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_rooms_updated_at'
  ) then
    create trigger set_rooms_updated_at
    before update on public.rooms
    for each row execute function public.set_updated_at();
  end if;
end;
$$;