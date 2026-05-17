import { supabase } from './src/lib/supabase.js';

async function run() {
  const url = supabase.supabaseUrl + '/rest/v1/?apikey=' + supabase.supabaseKey;
  const res = await fetch(url);
  const data = await res.json();
  if (data && data.definitions && data.definitions.closing_terminals) {
    console.log(Object.keys(data.definitions.closing_terminals.properties));
  } else if (data && data.paths) {
    console.log('paths available');
  } else {
    console.log(Object.keys(data));
  }
}

run();
