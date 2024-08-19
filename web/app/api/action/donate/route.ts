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
  ...ACTIONS_CORS_HEADERS,
  'Access-Control-Allow-Origin': '*', // Allow any origin
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function GET(request: Request) {
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

  const responseBody: ActionGetResponse = {
    icon: 'https://i.ibb.co/swzXkcM/solana.webp',
    description: `Highest contributorSOL`,
    title: 'Donate to a good cause',
    label: 'Stake SOL',
    links: {
      actions: [
        {
          label: 'Donate',
          href: '/api/action/donate?amount={amount}',
          parameters: [
            {
              name: 'title',
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
    headers: ACTIONS_CORS_HEADERS,
  });
  return response;
}

export async function POST(request: Request) {
  try {
    const requestBody: ActionPostRequest = await request.json();
    const url = new URL(request.url);

    const txAmount = url.searchParams.get('amount');
    const userPubkey = requestBody.account;

    // Validate the input
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

    const displayName = (requestBody as any).data?.title;

    const user = new PublicKey(userPubkey);
    const connection = new Connection(clusterApiUrl('mainnet-beta'));
    const ix = SystemProgram.transfer({
      fromPubkey: user,
      toPubkey: new PublicKey('BsdgGRzDmVTM8FBepRXrQixMZgjP6smsSbuDb1Y7VJB6'),
      lamports: Number(txAmount) * 1000000000, // Convert SOL to lamports
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

export const OPTIONS = GET;
