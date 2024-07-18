import supabase from '@/app/db/supabaseClient';

export default function Page() {
  console.log(supabase);
  return <h1>hello</h1>;
}
