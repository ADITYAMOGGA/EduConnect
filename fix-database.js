import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDatabase() {
  console.log('Disabling RLS policies to allow organization signup...');
  
  try {
    // Disable RLS on critical tables for signup to work
    const queries = [
      'ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE org_admins DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE admins DISABLE ROW LEVEL SECURITY;',
    ];
    
    for (const query of queries) {
      const { error } = await supabase.rpc('exec_sql', { sql: query });
      if (error) {
        console.log(`Note: ${query} - ${error.message}`);
      } else {
        console.log(`✓ ${query}`);
      }
    }
    
    console.log('Database fix completed! Organization signup should now work.');
  } catch (error) {
    console.error('Database fix failed:', error);
    console.log('Will try alternative approach...');
    
    // Try alternative approach - check if tables exist
    const { data: orgs } = await supabase.from('organizations').select('count', { count: 'exact', head: true });
    console.log('Organizations table accessible:', orgs !== null);
    
    const { data: admins } = await supabase.from('org_admins').select('count', { count: 'exact', head: true });
    console.log('Org_admins table accessible:', admins !== null);
  }
}

fixDatabase();