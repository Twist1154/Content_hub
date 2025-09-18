import { redirect } from 'next/navigation';

// Redirect to the new auth/reset-password route
export default function ResetPasswordPage() {
    redirect('/auth/reset-password');
}
