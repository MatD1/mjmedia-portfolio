import { redirect } from 'next/navigation';
import { auth } from '~/server/auth';
import AdminLayout from '~/components/admin/AdminLayout';

export default async function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect to sign in if not authenticated
  if (!session) {
    redirect('/api/auth/signin');
  }

  // Redirect to home if not admin
  if (session.user.role !== 'ADMIN') {
    redirect('/');
  }

  return <AdminLayout>{children}</AdminLayout>;
}
