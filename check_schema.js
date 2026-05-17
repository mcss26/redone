const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://iyknbgmcnbpvalvsjxjz.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5a25iZ21jbmJwdmFsdnNqeGp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNTc4MTEsImV4cCI6MjA4MzkzMzgxMX0.n3aFby5YOMZbyqwsWZPlSJuf_KzRB6woja70divY32A";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.from('master_proveedores').select('*').limit(1);
  if (error) console.error(error);
  if (data && data.length > 0) {
    console.log(Object.keys(data[0]));
    console.log(data[0]);
  } else {
    console.log("No data found");
  }
}
check();
