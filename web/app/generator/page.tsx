'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/app/db/supabaseClient';

export default function GeneratorPage() {
  const [imageUrl, setImageUrl] = useState('');
  const [title, setTitle] = useState('');
  const [destinationWallet, setDestinationWallet] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const uniqueId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const tableName = `blink_${uniqueId}`;
    const campaignId = uniqueId; // Use uniqueId as campaign_id for consistency

    console.log('Creating blink with ID:', uniqueId);

    try {
      const { error: tableError } = await supabase.rpc('create_blink_table', {
        table_name: tableName,
        p_image_url: imageUrl,
        p_title: title,
        p_destination_wallet: destinationWallet,
        p_campaign_id: campaignId
      });

      if (tableError) {
        console.error('Error creating blink table:', tableError);
        // Display error to user
        return;
      }

      console.log('Blink created successfully with ID:', uniqueId);

      // Redirect to dial.to with the new campaign URL
      const campaignUrl = encodeURIComponent(`http://cusp.live/api/action/donate?uniqueid=${uniqueId}`);
      const redirectUrl = `https://dial.to/developer?url=${campaignUrl}&cluster=mainnet`;
      router.push(redirectUrl);
    } catch (error) {
      console.error('Unexpected error:', error);
      // Display error to user
    }
  };

  const useDefaultImage = () => {
    setImageUrl('https://ipfs.io/ipfs/Qmf8qEtZqHnqT3cjfR5Khi8dFmdabJXrTevQyPfQ7dBNqg');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex flex-col justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">EzFund</h1>
          <p className="text-gray-600 mt-2">Launch your fundraising campaign in seconds</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">Image/GIF URL</label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-grow p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                placeholder="https://imgur.com/example123"
              />
              <button
                type="button"
                onClick={useDefaultImage}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-300"
              >
                Use Default
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Campaign Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              placeholder="Your fundraising title"
            />
          </div>
          <div>
            <label htmlFor="destinationWallet" className="block text-sm font-medium text-gray-700 mb-1">Destination Wallet Address</label>
            <input
              type="text"
              id="destinationWallet"
              value={destinationWallet}
              onChange={(e) => setDestinationWallet(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              placeholder="Solana wallet address"
            />
          </div>
          <button type="submit" className="w-full bg-purple-600 text-white p-3 rounded-md hover:bg-purple-700 transition duration-300 ease-in-out transform hover:scale-105">
            Launch Campaign
          </button>
        </form>
      </div>
      <footer className="mt-8 text-center text-white">
        <p>&copy; 2024 Cusp. All rights reserved.</p>
      </footer>
    </div>
  );
}