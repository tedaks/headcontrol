import { getAuthFromCookies } from '@/lib/auth';
import { getCachedUsers } from '@/lib/server-cache';
import { UserTable } from '@/components/users/user-table';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const auth = await getAuthFromCookies();
  if (!auth) {
    return <p className="text-muted-foreground">Not authenticated</p>;
  }
  const { users } = await getCachedUsers(auth.headscaleUrl, auth.apiKey);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Users</h1>
      </div>
      <UserTable users={users} />
    </div>
  );
}
