import { getAuthFromCookies } from "@/lib/auth";
import { createHeadscaleClient } from "@/lib/headscale-client";
import { KeyTable } from "@/components/preauthkeys/key-table";

export const dynamic = "force-dynamic";

export default async function PreAuthKeysPage() {
  const auth = await getAuthFromCookies();
  if (!auth) {
    return <p className="text-muted-foreground">Not authenticated</p>;
  }
  const headscale = createHeadscaleClient(auth.headscaleUrl, auth.apiKey);
  const [{ users }, { preAuthKeys }] = await Promise.all([
    headscale.users.list(),
    headscale.preAuthKeys.list(),
  ]);
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Pre-Auth Keys</h1>
      <KeyTable keys={preAuthKeys} users={users} />
    </div>
  );
}
