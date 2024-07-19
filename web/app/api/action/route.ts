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

export async function GET(request: Request) {
  const { data: notes, error } = await supabase.from('notes').select('*');
  console.log(notes);
  const responseBody: ActionGetResponse = {
    icon: 'https://i.ibb.co/swzXkcM/solana.webp',
    description: 'My blink',
    title: 'Blink',
    label: 'Click me',
    error: {
      message: 'This blink is not implemented yet!',
    },
  };

  return Response.json(responseBody, {
    headers: ACTIONS_CORS_HEADERS,
  });
}

export async function POST(request: Request) {
  const requestBody: ActionPostRequest = await request.json();
  const userPubkey = requestBody.account;
  console.log(userPubkey);
  const user = new PublicKey(userPubkey);
  const connection = new Connection(clusterApiUrl('devnet'));
  // const ix = SystemProgram.transfer({
  //   fromPubkey: userPubkey,
  //   toPubkey: new PublicKey("some address"),
  //   lamports: 1,
  // });
  const tx = new Transaction();
  tx.feePayer = new PublicKey(userPubkey);
  tx.recentBlockhash = (
    await connection.getLatestBlockhash({
      commitment: 'finalized',
    })
  ).blockhash;

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
    .order('id', { ascending: true })
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
