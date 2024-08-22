import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Create Your Donation Link',
  description: 'Launch your fundraising campaign in seconds',
};

export default function Page() {
  return (
    <head>
      <title>The Rock (1996)</title>
      <meta property="og:title" content="The Rock" />
      <meta property="og:type" content="video.movie" />
      <meta property="og:url" content="https://www.imdb.com/title/tt0117500/" />
      <meta
        property="og:image"
        content="https://ia.media-imdb.com/images/rock.jpg"
      />
    </head>
  );
  redirect('/generator');
}
