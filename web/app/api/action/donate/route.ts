import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
} from '@solana/actions';
import {
  clusterApiUrl,
  SystemProgram,
  Connection,
  PublicKey,
  Transaction,
} from '@solana/web3.js';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CORS_HEADERS = {
  ...ACTIONS_CORS_HEADERS,
  'Access-Control-Allow-Origin': '*', // Allow any origin
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const uniqueId = url.searchParams.get('uniqueid');

  // Handle the case without uniqueId (original functionality)
  if (!uniqueId) {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      return new Response(JSON.stringify({ error: 'Error fetching notes' }), {
        status: 501,
      });
    }

    console.log('Fetched notes:', data);

    const latestEntry = data[0];
    console.log('Latest entry:', latestEntry);

    const latestAmount = latestEntry?.amount as number;
    const latestAmountBy = latestEntry?.display_name as string;

    console.log(latestAmount);
    console.log(latestAmountBy);

    let highestAmount = 0;
    let highestAmountBy = '';
    let highestAmountEntry: any = null;

    data.forEach((note: any) => {
      if (note.amount && note.amount > highestAmount) {
        highestAmount = note.amount;
        console.log(note.display_name);
        if (note.display_name !== null) {
          highestAmountBy = note.display_name;
        }
        highestAmountEntry = note;
        console.log(note.display_name);
      }
    });

    if (highestAmountEntry) {
      console.log(
        `Highest amount entry: ${highestAmountEntry.id} with amount ${highestAmount}`
      );
    } else {
      console.log('No entries with amount found.');
    }

    const responseBody: ActionGetResponse = {
      icon: 'https://ipfs.io/ipfs/QmNzuaVxi7zguTw5dxw39hLHjfVZ8YHd51RYtZYqRPxYXg',
      description: `Highest contributor - ${highestAmountBy} : ${highestAmount} | Latest - ${latestAmountBy} : ${latestAmount}\n\nCreate your own fundraising campaign:\nhttps://cusp.live/generator`,
      title: 'Raise funds for developers on Solana',
      label: 'Stake SOL',
      links: {
        actions: [
          {
            label: 'Donate',
            href: '/api/action/donate?amount={amount}&display_name={display_name}',
            parameters: [
              {
                name: 'display_name',
                label: 'Display Name',
              },
              {
                name: 'amount',
                label: 'SOL amount',
              },
            ],
          },
        ],
      },
    };

    const response = Response.json(responseBody, {
      headers: CORS_HEADERS,
    });
    return response;
  }

  // Handle the case with uniqueId (new functionality)
  const tableName = `blink_${uniqueId}`;

  const { data: blinkData, error: blinkError } = await supabase
    .from(tableName)
    .select('*')
    .eq('id', 1)
    .single();

  if (blinkError) {
    console.error('Error fetching blink data:', blinkError);
    return new Response(
      JSON.stringify({ error: 'Error fetching blink data' }),
      {
        status: 500,
        headers: CORS_HEADERS,
      }
    );
  }

  const { data: donations, error: donationsError } = await supabase
    .from(tableName)
    .select('amount, display_name')
    .order('id', { ascending: false });

  if (donationsError) {
    console.error('Error fetching donations:', donationsError);
    return new Response(JSON.stringify({ error: 'Error fetching donations' }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }

  let highestAmount = 0;
  let highestAmountBy = '';
  let totalContribution = 0;
  const latestDonation = donations[0];

  donations.forEach((donation: any) => {
    totalContribution += donation.amount || 0;
    if (donation.amount > highestAmount) {
      highestAmount = donation.amount;
      highestAmountBy = donation.display_name || 'Anonymous';
    }
  });

  const responseBody: ActionGetResponse = {
    icon: blinkData.image_url,
    description: `Highest contributor - ${highestAmountBy}: ${highestAmount} | Latest - ${
      latestDonation?.display_name || 'Anonymous'
    }: ${
      latestDonation?.amount || 0
    } | Total Raised - ${totalContribution} \n\nCreate your own fundraising campaign:\nhttps://cusp.live/generator`,
    title: blinkData.title,
    label: 'Donate SOL',
    links: {
      actions: [
        {
          label: 'Donate',
          href: `/api/action/donate?amount={amount}&uniqueid=${uniqueId}&display_name={display_name}`,
          parameters: [
            {
              name: 'display_name',
              label: 'Display Name',
            },
            {
              name: 'amount',
              label: 'SOL amount',
            },
          ],
        },
      ],
    },
  };

  return Response.json(responseBody, {
    headers: ACTIONS_CORS_HEADERS,
  });
}

export const OPTIONS = GET;

// export async function OPTIONS(request: Request) {
//   return new Response(null, {
//     status: 204,
//     headers: CORS_HEADERS,
//   });
// }

export async function POST(request: Request) {
  try {
    const requestBody: ActionPostRequest<string> = await request.json();
    const url = new URL(request.url);

    console.log('Full URL:', request.url);
    console.log(
      'URL parameters:',
      Object.fromEntries(url.searchParams.entries())
    );
    console.log('Full request body:', JSON.stringify(requestBody, null, 2));

    const txAmount = url.searchParams.get('amount');
    const uniqueId = url.searchParams.get('uniqueid');
    const userPubkey = requestBody.account;
    const displayName = url.searchParams.get('display_name') || 'Anonymous';

    console.log('Received POST request:', {
      txAmount,
      uniqueId,
      userPubkey,
      displayName,
    });

    if (!userPubkey || !txAmount || !uniqueId) {
      console.error('Missing required fields:', {
        userPubkey,
        txAmount,
        uniqueId,
      });
      return new Response(
        JSON.stringify({
          message: 'Missing required fields: account, amount, or uniqueid',
        }),
        {
          status: 400,
          headers: CORS_HEADERS,
        }
      );
    }

    const tableName = `blink_${uniqueId}`;

    console.log('Fetching blink data from table:', tableName);

    const { data: blinkData, error: blinkError } = await supabase
      .from(tableName)
      .select('destination_wallet, image_url, title, campaign_id')
      .eq('id', 1)
      .single();

    if (blinkError) {
      console.error('Error fetching blink data:', blinkError);
      return new Response(
        JSON.stringify({ error: 'Error fetching blink data' }),
        {
          status: 500,
          headers: CORS_HEADERS,
        }
      );
    }

    if (!blinkData) {
      console.error('Blink data not found for uniqueId:', uniqueId);
      return new Response(JSON.stringify({ error: 'Blink data not found' }), {
        status: 404,
        headers: CORS_HEADERS,
      });
    }

    console.log('Blink data fetched successfully:', blinkData);

    const user = new PublicKey(userPubkey);
    const connection = new Connection(clusterApiUrl('mainnet-beta'));
    const ix = SystemProgram.transfer({
      fromPubkey: user,
      toPubkey: new PublicKey(blinkData.destination_wallet),
      lamports: Number(txAmount) * 1000000000,
    });
    const tx = new Transaction();
    tx.add(ix);
    tx.feePayer = user;

    const bh = (
      await connection.getLatestBlockhash({
        commitment: 'finalized',
      })
    ).blockhash;

    tx.recentBlockhash = bh;

    const serialTX = tx
      .serialize({ requireAllSignatures: false, verifySignatures: false })
      .toString('base64');

    console.log('Transaction created successfully');

    const { error: insertError } = await supabase.from(tableName).insert([
      {
        amount: Number(txAmount),
        display_name: displayName,
        image_url: blinkData.image_url,
        title: blinkData.title,
        destination_wallet: blinkData.destination_wallet,
        campaign_id: blinkData.campaign_id,
      },
    ]);

    if (insertError) {
      console.error('Error inserting new donation:', insertError);
      return new Response(
        JSON.stringify({ error: 'Error inserting new donation' }),
        {
          status: 500,
          headers: CORS_HEADERS,
        }
      );
    }

    console.log('Donation inserted successfully');

    const response: ActionPostResponse = {
      transaction: serialTX,
      message: 'Thank you for donating!',
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (error) {
    console.error('Unexpected error in POST handler:', error);
    let errorMessage = 'An unexpected error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}
