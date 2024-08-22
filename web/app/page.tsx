import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Create Your Donation Link',
  description: 'Launch your fundraising campaign in seconds',
};

export default function Page() {
  return (
    <>
      <head>
        <title>EzFund - Create Your Donation Link</title>
        <meta property="og:title" content="EzFund - Create Your Donation Link" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://your-domain.com" />
        <meta
          property="og:image"
          content="https://your-domain.com/path-to-your-image.jpg"
        />
        <meta
          property="og:description"
          content="Launch your fundraising campaign in seconds with EzFund"
        />
      </head>
      {redirect('/generator')}
    </>
  );
}