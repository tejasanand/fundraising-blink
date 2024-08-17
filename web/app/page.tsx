import supabase from '@/app/db/supabaseClient';

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

export default function Page() {
  console.log(supabase);
  return <h1>hello</h1>;
}
