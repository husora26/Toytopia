/**
 * Server für Foto-zu-3D (Supabase Edge Function `toy-3d`).
 * Der Anon-Schlüssel ist öffentlich gedacht und darf im Code stehen; der Meshy-Schlüssel liegt nur auf dem Server.
 */
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? 'https://ggsoygxmcsmrsrbmplrz.supabase.co'
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdnc295Z3htY3NtcnNyYm1wbHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMTA1MzQsImV4cCI6MjEwODg4NjUzNH0.6AIs_Ot2Pk7Y8STicdkFn0JZ8C46IPCbzmPRhRzArx4'
