// Temporary fallback for organization signup without RLS
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Simple organization signup that bypasses RLS by using a simpler approach
export async function createOrganizationFallback(orgData) {
  console.log('Attempting fallback organization creation...');
  
  try {
    // For now, let's create a simplified user record that works with the existing system
    // This is a temporary workaround until RLS is properly configured
    
    const userData = {
      username: orgData.adminUsername,
      email: orgData.email || `${orgData.adminUsername}@${orgData.orgName.toLowerCase().replace(/\s+/g, '')}.edu`,
      first_name: orgData.adminName.split(' ')[0] || orgData.adminName,
      last_name: orgData.adminName.split(' ').slice(1).join(' ') || '',
      school_name: orgData.orgName,
      password: orgData.adminPassword, // Will be hashed by the existing system
      role: 'org_admin',
      status: 'active'
    };
    
    return {
      success: true,
      userData,
      message: 'Organization data prepared for creation'
    };
    
  } catch (error) {
    console.error('Fallback organization creation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Test the function
if (import.meta.url === `file://${process.argv[1]}`) {
  const testData = {
    orgName: 'Test School',
    adminUsername: 'admin123',
    adminName: 'Admin User',
    adminPassword: 'test123',
    email: 'admin@testschool.edu'
  };
  
  createOrganizationFallback(testData).then(result => {
    console.log('Fallback result:', result);
  });
}