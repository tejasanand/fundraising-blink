import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Create Your Donation Link',
  description: 'Launch your fundraising campaign in seconds',
}

export default function Page() {
  redirect('/generator')
}