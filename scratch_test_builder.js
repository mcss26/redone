import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env vars manually
const envFile = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envFile, 'utf-8');
const envLines = envContent.split('\n');
let supabaseUrl = '';
let supabaseKey = '';

for (const line of envLines) {
  if (line.startsWith('VITE_SUPABASE_URL=')) {
    supabaseUrl = line.split('=')[1].trim();
  }
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
    supabaseKey = line.split('=')[1].trim();
  }
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQueryBuilder() {
  const query = supabase
    .from('stg_passline_tickets')
    .select('id')
    .eq('operational_date', '2026-05-09');

  const { data: page1 } = await query.range(0, 999);
  console.log('Page 1 length:', page1 ? page1.length : 'error');

  const { data: page2 } = await query.range(1000, 1999);
  console.log('Page 2 length:', page2 ? page2.length : 'error');
}

testQueryBuilder();
