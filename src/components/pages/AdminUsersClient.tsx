'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '~/components/ui/Card';
import Button from '~/components/ui/Button';
import Badge from '~/components/ui/Badge';
import { api } from '~/trpc/react';

interface UserItem {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: 'ADMIN' | 'VIEWER';
  createdAt: string | Date;
}

interface AdminUsersClientProps {
  users: UserItem[];
}

export default function AdminUsersClient({ users }: AdminUsersClientProps) {
  const utils = api.useUtils();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const updateRole = api.user.updateRole.useMutation({
    onSuccess: async () => {
      await utils.user.getAll.invalidate();
      setUpdatingId(null);
    },
    onError: () => setUpdatingId(null),
  });

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="pixel-text text-3xl text-glow mb-2">Users</h1>
        <p className="text-[var(--text-secondary)]">Manage user roles and access.</p>
      </motion.div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-[var(--border-primary)]">
                <th className="py-3 pr-4">User</th>
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4">Role</th>
                <th className="py-3 pr-4">Joined</th>
                <th className="py-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-[var(--bg-tertiary)]">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      {u.image ? (
                        <img src={u.image} alt={u.name ?? u.email ?? 'User'} className="w-8 h-8 rounded border border-[var(--border-primary)] object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-[var(--bg-tertiary)] border border-[var(--border-primary)]" />
                      )}
                      <div className="min-w-0">
                        <div className="text-[var(--text-primary)] truncate">{u.name ?? '—'}</div>
                        <div className="text-[var(--text-muted)] truncate">{u.email ?? '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 hidden md:table-cell">{u.email ?? '—'}</td>
                  <td className="py-3 pr-4">
                    <Badge variant={u.role === 'ADMIN' ? 'success' : 'default'} size="sm">{u.role}</Badge>
                  </td>
                  <td className="py-3 pr-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 pr-4 text-right">
                    <div className="inline-flex gap-2">
                      <select
                        className="bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded px-2 py-1"
                        value={u.role}
                        onChange={(e) => {
                          setUpdatingId(u.id);
                          updateRole.mutate({ userId: u.id, role: e.target.value as 'ADMIN' | 'VIEWER' });
                        }}
                        disabled={updatingId === u.id}
                      >
                        <option value="VIEWER">VIEWER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                      <Button size="sm" variant="secondary" disabled>{updatingId === u.id ? 'Saving...' : 'Change'}</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}


