/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignupAndProfile() {
  const timestamp = Date.now();
  const email = `api_test_${timestamp}@example.com`;
  const password = 'TestPassword123!';
  const fullName = 'API Test User';

  console.log('Testing signup for:', email);

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role: 'organizer' }
    }
  });

  if (authError) {
    console.error('Signup Error:', authError.message);
    return;
  }

  const userId = authData.user.id;
  console.log('User created:', userId);

  // Poll for profile
  console.log('Polling for profile...');
  for (let i = 0; i < 5; i++) {
    const { data: profile, error: profError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile) {
      console.log('SUCCESS: Profile found!', JSON.stringify(profile, null, 2));
      return;
    }

    console.log(`Attempt ${i + 1} failed, retrying in 2s...`);
    await new Promise(r => setTimeout(r, 2000));
  }

  console.error('FAILURE: Profile not created after polling.');
}

testSignupAndProfile();
