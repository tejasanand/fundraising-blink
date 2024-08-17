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
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error('Error fetching notes:', error);
    return new Response(JSON.stringify({ error: 'Error fetching notes' }), {
      status: 500,
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
    icon: 'https://i.ibb.co/swzXkcM/solana.webp',
    description: `Highest contributor: ${highestAmountBy} - ${highestAmount} SOL, Latest: ${latestAmountBy} - ${latestAmount} SOL`,
    title: 'Donate to a good cause',
    label: 'Stake SOL',
    links: {
      actions: [
        {
          label: 'Donate', // button text
          href: '/api/action/donate?amount={amount}', // or /api/donate?amount={amount}
          parameters: [
            // {amount} input field
            {
              name: 'title',
              label: 'Display Name',
            },
            {
              name: 'amount', // input field name
              label: 'SOL amount', // text input placeholder
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
