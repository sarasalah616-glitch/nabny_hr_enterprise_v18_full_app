create extension if not exists "uuid-ossp";
create table if not exists license_keys (
  id uuid primary key default uuid_generate_v4(),
  client_name text not null,
  system_name text not null,
  machine_id text not null,
  activation_code text not null,
  plan text default 'FULL',
  expires_at date,
  is_active boolean default true,
  created_at timestamptz default now()
);
