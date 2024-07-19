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
    label: 'Stake SOL',
    error: {
      message: 'This blink is not implemented yet!',
    },

    links: {
      actions: [
        {
          label: 'Donate', // button text
          href: '/api/action/donate?amount={amount}', // or /api/donate?amount={amount}
          parameters: [
            // {amount} input field
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
