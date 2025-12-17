// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ajqeivmkvfgejmmhygdg.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqcWVpdm1rdmZnZWptbWh5Z2RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MzgzNjUsImV4cCI6MjA4MTQxNDM2NX0.ar2DQYrykVJhnVEF5wMu6_S8pOLhEmZizf1pZg2Q0Qg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
