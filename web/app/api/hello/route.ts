import supabase from '@/app/db/supabaseClient';

export async function GET(request: Request) {
  // const { data: notes, error } = await supabase.from('notes').select('*');

  // console.log(notes);

  // if (error) {
  //   console.error('Error fetching notes:', error);
  //   return new Response('Error fetching notes', { status: 500 });
  // }

  // console.log('Notes:', notes);

  // return new Response(JSON.stringify(notes), {
  //   status: 200,
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  // });

  return new Response('Hello, from API!');
}
