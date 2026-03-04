import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://utngmgzwnscmnldquhcp.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0bmdtZ3p3bnNjbW5sZHF1aGNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5OTU0MzMsImV4cCI6MjA4NzU3MTQzM30.KqaElz6O1i3_RiZXdl3DH_-OLJefvQYga66okqc3l5I";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
