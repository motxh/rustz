import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rmwmudmaezfqqntuteqw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtd211ZG1hZXpmcXFudHV0ZXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3OTM3MTQsImV4cCI6MjA1MjM2OTcxNH0.-CXdRpMEE1PASpDCT4OmWFXdgVjB9Wopj1opx-_lmX4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 