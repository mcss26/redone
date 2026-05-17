import { createClient } from '@supabase/supabase-js'

// Hardcoded temporalmente para evitar tener que reiniciar el servidor Vite de tu terminal
const supabaseUrl = "https://iyknbgmcnbpvalvsjxjz.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5a25iZ21jbmJwdmFsdnNqeGp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNTc4MTEsImV4cCI6MjA4MzkzMzgxMX0.n3aFby5YOMZbyqwsWZPlSJuf_KzRB6woja70divY32A"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
