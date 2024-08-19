import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
} from '@solana/actions';
import { clusterApiUrl, SystemProgram, Connection } from '@solana/web3.js';
// import supabase from '@/app/db/supabaseClient';

import { PublicKey } from '@solana/web3.js';

import { Transaction } from '@solana/web3.js';

export async function GET(request: Request) {
  // const { data, error } = await supabase
  //   .from('notes')
  //   .select('*')
  //   .order('id', { ascending: false });

  // if (error) {
  //   console.error('Error fetching notes:', error);
  //   return new Response(JSON.stringify({ error: 'Error fetching notes' }), {
  //     status: 500,
  //   });
  // }

  // if (!data || data.length === 0) {
  //   console.log('No notes found.');
  //   return new Response(JSON.stringify({ error: 'No notes found' }), {
  //     status: 404,
  //   });
  // }

  // console.log('Fetched notes:', data);

  // const latestEntry = data[0];
  // console.log('Latest entry:', latestEntry);

  // const latestAmount = latestEntry?.amount as number;
  // const latestAmountBy = latestEntry?.display_name as string;

  // console.log(latestAmount);
  // console.log(latestAmountBy);

  // let highestAmount = 0;
  // let highestAmountBy = '';
  // let highestAmountEntry: any = null;

  // data.forEach((note: any) => {
  //   if (note.amount && note.amount > highestAmount) {
  //     highestAmount = note.amount;
  //     if (note.display_name !== null) {
  //       highestAmountBy = note.display_name;
  //     }
  //     highestAmountEntry = note;
  //   }
  // });

  // if (highestAmountEntry) {
  //   console.log(
  //     `Highest amount entry: ${highestAmountEntry.id} with amount ${highestAmount}`
  //   );
  // } else {
  //   console.log('No entries with amount found.');
  // }

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
  const requestBody: ActionPostRequest = await request.json();
  const url = new URL(request.url);
  console.log('Request Body:', requestBody);

  const txAmount = url.searchParams.get('amount');
  const userPubkey = requestBody.account;
  const displayName = (requestBody as any).data.title;

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

  // const { data, error } = await supabase
  //   .from('notes')
  //   .select('id')
  //   .order('id', { ascending: false })
  //   .limit(1);

  // if (error) {
  //   console.error('Error fetching last entry:', error);
  //   return new Response(
  //     JSON.stringify({ error: 'Error fetching last entry' }),
  //     { status: 500 }
  //   );
  // }

  // let newId;
  // if (data && data.length > 0) {
  //   const lastId = data[0].id;
  //   newId = lastId + 1;
  // } else {
  //   newId = 1;
  // }

  // const { data: insertData, error: insertError } = await supabase
  //   .from('notes')
  //   .insert([
  //     {
  //       id: newId,
  //       title: userPubkey,
  //       amount: Number(txAmount),
  //       display_name: displayName,
  //     },
  //   ]);

  // if (insertError) {
  //   console.error('Error inserting new row:', insertError);
  //   return new Response(JSON.stringify({ error: 'Error inserting new row' }), {
  //     status: 500,
  //   });
  // }

  // Return only the transaction and message
  return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
}

export const OPTIONS = GET;
