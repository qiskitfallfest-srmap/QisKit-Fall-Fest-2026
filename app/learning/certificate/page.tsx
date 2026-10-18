import { redirect } from 'next/navigation';

export default function LearningCertificateRedirectPage() {
  redirect('/learning?certificate=true');
}
