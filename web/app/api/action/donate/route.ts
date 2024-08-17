import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
} from '@solana/actions';
import { clusterApiUrl, SystemProgram, Connection } from '@solana/web3.js';
import supabase from '@/app/db/supabaseClient';

import { PublicKey } from '@solana/web3.js';

import { Transaction } from '@solana/web3.js';

export async function POST(request: Request) {
  const requestBody: ActionPostRequest = await request.json();
  const url = new URL(request.url);
  console.log('Request Body:', requestBody);
  const txAmount = url.searchParams.get('amount');
  const userPubkey = requestBody.account;
  const displayName = (requestBody as any).data.title;

  console.log(userPubkey);

  console.log(txAmount);

  console.log(displayName);

  console.log();
  const user = new PublicKey(userPubkey);
  const connection = new Connection(clusterApiUrl('mainnet-beta'));
  const ix = SystemProgram.transfer({
    fromPubkey: user,
    toPubkey: new PublicKey('Gfnt56Lqjm8fepkJzsRKv493J9qC8cQwaDiYNM26tHd6'),
    lamports: 1,
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

  const { data, error } = await supabase
    .from('notes')
    .select('id')
    .order('id', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching last entry:', error);
    return new Response(
      JSON.stringify({ error: 'Error fetching last entry' }),
      { status: 500 }
    );
  }

  let newId;
  if (data && data.length > 0) {
    const lastId = data[0].id;
    newId = lastId + 1;
  } else {
    newId = 1;
  }

  const { data: insertData, error: insertError } = await supabase
    .from('notes')
    .insert([
      {
        id: newId,
        title: userPubkey,
        amount: Number(txAmount),
        display_name: displayName,
      },
    ]);

  if (insertError) {
    console.error('Error inserting new row:', insertError);
    return new Response(JSON.stringify({ error: 'Error inserting new row' }), {
      status: 500,
    });
  }

  return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
}

export async function OPTIONS(request: Request) {
  return new Response(null, { headers: ACTIONS_CORS_HEADERS });
}
