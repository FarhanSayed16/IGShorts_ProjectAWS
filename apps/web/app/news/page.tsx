import { redirect } from 'next/navigation';

export default function NewsRedirectPage() {
  redirect('/trending/news');
}
