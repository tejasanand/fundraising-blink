import { NextRequest, NextResponse } from 'next/server';
import { ActionPostRequest, ActionPostResponse } from '@solana/actions';
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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('Received POST request for blink ID:', params.id);
  try {
    const { data: blinkData, error: blinkError } = await supabase
      .from(`blink_${params.id}` as `blink_${string}`)
      .select('destination_wallet, image_url, title')
      .eq('id', 1)
      .single();

    if (blinkError) {
      console.error('Error fetching blink data:', blinkError);
      return NextResponse.json(
        { error: 'Error fetching blink data' },
        {
          status: 500,
          headers: CORS_HEADERS,
        }
      );
    }

    if (!blinkData) {
      console.error('Blink not found for ID:', params.id);
      return NextResponse.json(
        { error: 'Blink not found' },
        {
          status: 404,
          headers: CORS_HEADERS,
        }
      );
    }

    const requestBody: ActionPostRequest = await request.json();
    const url = new URL(request.nextUrl);

    const txAmount = url.searchParams.get('amount');
    const userPubkey = requestBody.account;

    if (!userPubkey || !txAmount) {
      return NextResponse.json(
        {
          message: 'Missing required fields: account or amount',
        },
        {
          status: 400,
          headers: CORS_HEADERS,
        }
      );
    }
    const displayName = (requestBody as any).data?.display_name;

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

    const { error: insertError } = await supabase
      .from(`blink_${params.id}` as `blink_${string}`)
      .insert([
        {
          title: blinkData.title, // Use the original blink title
          amount: Number(txAmount),
          display_name: displayName,
          image_url: blinkData.image_url,
          destination_wallet: blinkData.destination_wallet,
        },
      ]);

    if (insertError) {
      console.error('Error inserting new row:', insertError);
      return NextResponse.json(
        { error: 'Error inserting new row' },
        {
          status: 500,
          headers: CORS_HEADERS,
        }
      );
    }

    const response: ActionPostResponse = {
      transaction: serialTX,
      message: 'Thank you for donating anon',
    };

    return NextResponse.json(response, {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (error) {
    console.error('Unexpected error in POST handler:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      {
        status: 500,
        headers: CORS_HEADERS,
      }
    );
  }
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}
