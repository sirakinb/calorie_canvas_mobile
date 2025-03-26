-- Create a table for user profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  daily_calorie_goal integer default 2000,
  daily_protein_goal integer default 150,
  daily_carbs_goal integer default 250,
  daily_fat_goal integer default 65,
  
  constraint username_length check (char_length(username) >= 3)
);

-- Create a table for nutrition entries
create table nutrition_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  image_url text,
  description text,
  calories integer,
  protein numeric(5,1),
  carbs numeric(5,1),
  fat numeric(5,1),
  meal_type text check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  notes text
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;
alter table nutrition_entries enable row level security;

-- Create policies
create policy "Users can view their own profile."
  on profiles for select
  using ( auth.uid() = id );

create policy "Users can update their own profile."
  on profiles for update
  using ( auth.uid() = id );

create policy "Users can view their own nutrition entries."
  on nutrition_entries for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own nutrition entries."
  on nutrition_entries for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own nutrition entries."
  on nutrition_entries for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own nutrition entries."
  on nutrition_entries for delete
  using ( auth.uid() = user_id );

-- Function to handle new user creation
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

-- Trigger to automatically create profile for new users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 