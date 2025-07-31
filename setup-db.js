import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('Checking database setup...');
  
  try {
    // Check if organizations table exists by trying to query it
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .limit(1);
    
    if (orgError) {
      console.log('Organizations table error:', orgError.message);
      if (orgError.code === '42P01') {
        console.log('Organizations table does not exist - need to create schema');
      }
    } else {
      console.log('Organizations table exists');
    }
    
    // Check if org_admins table exists
    const { data: admins, error: adminError } = await supabase
      .from('org_admins')
      .select('id')
      .limit(1);
    
    if (adminError) {
      console.log('Org_admins table error:', adminError.message);
      if (adminError.code === '42P01') {
        console.log('Org_admins table does not exist - need to create schema');
      }
    } else {
      console.log('Org_admins table exists');
    }
    
    // Try to insert a test organization directly
    console.log('\nTrying test organization insert...');
    const { data: testOrg, error: testError } = await supabase
      .from('organizations')
      .insert({
        name: 'Test School',
        board_type: 'CBSE'
      })
      .select()
      .single();
    
    if (testError) {
      console.log('Test insert error:', testError);
    } else {
      console.log('Test organization created successfully:', testOrg.id);
      
      // Clean up test data
      await supabase.from('organizations').delete().eq('id', testOrg.id);
      console.log('Test data cleaned up');
    }
    
  } catch (error) {
    console.error('Database setup check failed:', error);
  }
}

setupDatabase();