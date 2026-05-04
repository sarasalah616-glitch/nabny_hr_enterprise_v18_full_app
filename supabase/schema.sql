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


-- V19.0 additions
create table if not exists project_locations (
  id text primary key,
  name text not null,
  project text,
  lat numeric not null,
  lng numeric not null,
  radius numeric default 100,
  manager_phone text,
  created_at timestamp with time zone default now()
);

create table if not exists whatsapp_queue (
  id text primary key,
  to_phone text,
  title text,
  message text,
  status text default 'ready',
  provider text default 'WhatsApp Official Cloud API',
  created_at timestamp with time zone default now(),
  sent_at timestamp with time zone
);

create table if not exists rules_engine (
  id text primary key,
  name text not null,
  metric text not null,
  operator text not null,
  value numeric default 0,
  action text not null,
  amount numeric default 0,
  active boolean default true,
  created_at timestamp with time zone default now()
);
