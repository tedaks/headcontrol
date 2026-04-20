import { headscale } from "@/lib/headscale-client";
import { UserTable } from "@/components/users/user-table";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const { users } = await headscale.users.list();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Users</h1>
      </div>
      <UserTable users={users} />
    </div>
  );
}
