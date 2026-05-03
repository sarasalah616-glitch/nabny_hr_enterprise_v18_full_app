create extension if not exists "uuid-ossp";

create table if not exists companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  activity text default 'مقاولات',
  logo_url text,
  watermark_text text default 'NABNY',
  created_at timestamptz default now()
);

create table if not exists work_locations (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade,
  name text not null,
  lat numeric not null,
  lng numeric not null,
  radius_meters int default 100,
  created_at timestamptz default now()
);

create table if not exists employees (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade,
  employee_code text not null,
  full_name text not null,
  iqama_number text,
  job_title text,
  department text,
  project text,
  branch text,
  work_location_id uuid references work_locations(id),
  email text,
  phone text,
  basic_salary numeric default 0,
  housing_allowance numeric default 0,
  transport_allowance numeric default 0,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists app_users (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade,
  employee_id uuid references employees(id) on delete set null,
  username text unique not null,
  password_hash text,
  role text not null check (role in ('admin','hr','manager','employee')),
  email text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists attendance_records (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade,
  employee_id uuid references employees(id) on delete cascade,
  work_location_id uuid references work_locations(id),
  attendance_date date not null,
  attendance_month text not null,
  check_in timestamptz,
  check_out timestamptz,
  status text default 'present',
  delay_minutes int default 0,
  distance_meters int,
  gps_status text,
  device_status text,
  face_status text,
  created_at timestamptz default now(),
  unique(employee_id, attendance_date)
);

create table if not exists employee_requests (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade,
  employee_id uuid references employees(id) on delete cascade,
  request_type text not null,
  from_date date,
  to_date date,
  amount numeric,
  notes text,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade,
  to_user_id uuid references app_users(id) on delete cascade,
  to_employee_id uuid references employees(id) on delete cascade,
  to_role text,
  title text not null,
  message text not null,
  type text default 'system',
  is_read boolean default false,
  created_at timestamptz default now()
);

create table if not exists email_queue (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade,
  recipient_email text not null,
  subject text not null,
  body text not null,
  status text default 'queued',
  error_message text,
  sent_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists payroll_runs (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade,
  employee_id uuid references employees(id) on delete cascade,
  period text not null,
  basic_salary numeric default 0,
  housing_allowance numeric default 0,
  transport_allowance numeric default 0,
  present_days int default 0,
  absent_days int default 0,
  late_minutes int default 0,
  absence_deduction numeric default 0,
  late_deduction numeric default 0,
  overtime_amount numeric default 0,
  net_salary numeric default 0,
  created_at timestamptz default now()
);

create table if not exists generated_forms (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade,
  employee_id uuid references employees(id) on delete set null,
  title text not null,
  form_data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
