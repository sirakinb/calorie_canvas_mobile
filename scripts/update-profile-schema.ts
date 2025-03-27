import { supabase } from '../lib/supabase';

async function updateProfileSchema() {
  try {
    // Add new columns to the profiles table
    const { error } = await supabase.rpc('update_profile_schema', {
      sql_commands: `
        ALTER TABLE profiles
        ADD COLUMN IF NOT EXISTS age integer,
        ADD COLUMN IF NOT EXISTS sex text,
        ADD COLUMN IF NOT EXISTS height_ft integer,
        ADD COLUMN IF NOT EXISTS height_in integer,
        ADD COLUMN IF NOT EXISTS weight integer,
        ADD COLUMN IF NOT EXISTS activity_level text,
        ADD COLUMN IF NOT EXISTS fitness_goal text,
        ADD COLUMN IF NOT EXISTS daily_calorie_goal integer,
        ADD COLUMN IF NOT EXISTS daily_protein_goal integer,
        ADD COLUMN IF NOT EXISTS daily_carbs_goal integer,
        ADD COLUMN IF NOT EXISTS daily_fat_goal integer;
      `
    });

    if (error) {
      console.error('Error updating schema:', error);
      return;
    }

    console.log('Successfully updated profiles table schema');
  } catch (error) {
    console.error('Error:', error);
  }
}

updateProfileSchema(); 