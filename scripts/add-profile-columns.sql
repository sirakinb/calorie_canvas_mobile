-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS age integer,
ADD COLUMN IF NOT EXISTS sex text,
ADD COLUMN IF NOT EXISTS height_ft integer,
ADD COLUMN IF NOT EXISTS height_in integer,
ADD COLUMN IF NOT EXISTS weight integer,
ADD COLUMN IF NOT EXISTS activity_level text check (activity_level in ('sedentary', 'moderate', 'very')),
ADD COLUMN IF NOT EXISTS fitness_goal text check (fitness_goal in ('maintenance', 'fat_loss', 'muscle_gain'));

-- Update the handle_new_user function to include default values
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
begin
  insert into public.profiles (
    id,
    full_name,
    avatar_url,
    daily_calorie_goal,
    daily_protein_goal,
    daily_carbs_goal,
    daily_fat_goal
  )
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    2000,  -- default daily calorie goal
    150,   -- default daily protein goal
    250,   -- default daily carbs goal
    65     -- default daily fat goal
  );
  return new;
end;
$$; 