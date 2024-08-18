/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
      return [
        {
          source: '/api/action/:path*',
          headers: [
            { key: 'Access-Control-Allow-Credentials', value: 'true' },
            {
              key: 'Access-Control-Allow-Origin',
              value: '*',
            },
            {
              key: 'Access-Control-Allow-Methods',
              value: 'GET, POST, OPTIONS',
            },
            {
              key: 'Access-Control-Allow-Headers',
              value: 'Accept, Content-Type, Content-Encoding, Accept-Encoding',
            },
          ],
        },
        {
          source: '/actions.json',
          headers: [
            { key: 'Access-Control-Allow-Credentials', value: 'true' },
            {
              key: 'Access-Control-Allow-Origin',
              value: '*',
            },
            {
              key: 'Access-Control-Allow-Methods',
              value: 'GET, POST, OPTIONS',
            },
            {
              key: 'Access-Control-Allow-Headers',
              value: 'Accept, Content-Type, Content-Encoding, Accept-Encoding',
            },
          ],
        },
      ];
    },
  };
  
  export default nextConfig;