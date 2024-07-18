import supabase from '@/app/db/supabaseClient';

export async function GET(request: Request) {
  return new Response('Hello, from API!');
  console.log(supabase);
}
