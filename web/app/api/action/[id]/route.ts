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

import supabase from '@/app/db/supabaseClient';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface BlinkData {
  id: number;
  image_url: string;
  title: string;
  destination_wallet: string;
  campaign_id: string;
  amount?: number;
  display_name?: string;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const tableName = `blink_${params.id}` as `blink_${string}`;

  // Fetch the blink data
  const { data: blinkData, error: blinkError } = await supabase
    .from(tableName)
    .select('*')
    .order('id', { ascending: false })
    .limit(1)
    .single();

  if (blinkError) {
    return new Response(JSON.stringify({ error: 'Blink not found' }), {
      status: 404,
      headers: CORS_HEADERS,
    });
  }

  const typedBlinkData = blinkData as BlinkData;

  // Fetch donations for this blink
  const { data: donations, error: donationsError } = await supabase
    .from(tableName)
    .select('amount, display_name')
    .order('id', { ascending: false });

  if (donationsError) {
    console.error('Error fetching donations:', donationsError);
    return new Response(JSON.stringify({ error: 'Error fetching donations' }), {
      status: 501,
      headers: CORS_HEADERS,
    });
  }

  // Calculate highest and latest donations
  let highestAmount = 0;
  let highestAmountBy = '';
  const latestDonation = donations[0];

  donations.forEach((donation: any) => {
    if (donation.amount > highestAmount) {
      highestAmount = donation.amount;
      highestAmountBy = donation.display_name;
    }
  });

  const responseBody: ActionGetResponse = {
    icon: typedBlinkData.image_url,
    description: `Highest contributor - ${highestAmountBy}: ${highestAmount} | Latest - ${latestDonation?.display_name}: ${latestDonation?.amount || 0}\n\nMake your own fundraising campaign at https://cusp.live/generator`,
    title: typedBlinkData.title ?? 'Untitled Blink',
    label: 'Donate SOL',
    links: {
      actions: [
        {
          label: 'Donate',
          href: `/api/action/${params.id}/donate?amount={amount}&campaign=${typedBlinkData.campaign_id}`,
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
    headers: CORS_HEADERS,
  });
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { data: blinkData, error: blinkError } = await supabase
      .from('fundraising-blink')
      .select('destination_wallet')
      .eq('id', params.id)
      .single();

    if (blinkError || !blinkData) {
      return new Response(JSON.stringify({ error: 'Blink not found' }), {
        status: 404,
        headers: CORS_HEADERS,
      });
    }

    const { data: blinkMetadata, error: blinkMetadataError } = await supabase
      .from('fundraising-blink')
      .select('image_url, destination_wallet')
      .eq('id', params.id)
      .single();

    if (blinkMetadataError || !blinkMetadata) {
      console.error('Error fetching blink metadata:', blinkMetadataError);
      return new Response(
        JSON.stringify({ error: 'Error fetching blink metadata' }),
        {
          status: 500,
          headers: CORS_HEADERS,
        }
      );
    }

    const requestBody: ActionPostRequest<string> = await request.json();
    const url = new URL(request.url);

    const txAmount = url.searchParams.get('amount');
    const userPubkey = requestBody.account;

    if (!userPubkey || !txAmount) {
      return new Response(
        JSON.stringify({
          message: 'Missing required fields: account or amount',
        }),
        {
          status: 400,
          headers: CORS_HEADERS,
        }
      );
    }

    const displayName = url.searchParams.get('display_name') || 'Anonymous';

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

    const response: ActionPostResponse = {
      transaction: serialTX,
      message: 'Thank you for donating anon',
    };

    const { error: insertError } = await supabase
      .from(`blink_${params.id}` as `blink_${string}`)
      .insert([
        {
          title: userPubkey,
          amount: Number(txAmount),
          display_name: displayName,
          image_url: blinkMetadata.image_url,
          destination_wallet: blinkMetadata.destination_wallet
        }
      ]);

    if (insertError) {
      console.error('Error inserting new row:', insertError);
      return new Response(
        JSON.stringify({ error: 'Error inserting new row' }),
        {
          status: 500,
          headers: CORS_HEADERS,
        }
      );
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (error) {
    console.error('Error processing POST request:', error);

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