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
  const userPubkey = requestBody.account;
  console.log(userPubkey);
  const user = new PublicKey(userPubkey);
  const connection = new Connection(clusterApiUrl('devnet'));
  const ix = SystemProgram.transfer({
    fromPubkey: user,
    toPubkey: new PublicKey('FgiRZff6Xu3KEbrzY23XkharPQ6La9fxqyuCMZPbVs5E'),
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
    message: 'hello ' + userPubkey,
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
    .insert([{ id: newId, title: userPubkey }]);

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
