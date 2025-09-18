import { redirect } from 'next/navigation';

export default function Home() {
  // The middleware will handle redirection for logged-in users.
  // This page can serve as a landing page or redirect to the client sign-in.
  redirect('/auth/client/signin');
}
