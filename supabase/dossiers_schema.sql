-- Create the dossiers table
create table dossiers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  client_name text not null,
  project_name text not null,
  salesperson text not null,
  data jsonb not null
);

-- Enable Row Level Security (RLS)
alter table dossiers enable row level security;

-- Create policy to allow all operations for now (can be restricted later based on auth)
create policy "Enable all access for all users" on dossiers
  for all using (true);
