import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

<head>
  <title>The Rock (1996)</title>
  <meta property="og:title" content="The Rock" />
  <meta property="og:type" content="video.movie" />
  <meta property="og:url" content="https://www.imdb.com/title/tt0117500/" />
  <meta
    property="og:image"
    content="https://ia.media-imdb.com/images/rock.jpg"
  />
  ...
</head>;

export default async function Page() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: todos } = await supabase.from('todos').select();

  return <h1>hello</h1>;
}
