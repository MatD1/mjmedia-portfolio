import { api } from '~/trpc/server';
import AdminUsersClient from '~/components/pages/AdminUsersClient';

export default async function AdminUsersPage() {
  const users = await api.user.getAll({ limit: 50 });
  return <AdminUsersClient users={users.items} />;
}


