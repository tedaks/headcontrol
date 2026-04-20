import { getAuthFromCookies } from "@/lib/auth";
import { createHeadscaleClient } from "@/lib/headscale-client";
import { ApiKeyTable } from "@/components/apikeys/apikey-table";

export const dynamic = "force-dynamic";

export default async function ApiKeysPage() {
  const auth = await getAuthFromCookies();
  if (!auth) {
    return <p className="text-muted-foreground">Not authenticated</p>;
  }
  const headscale = createHeadscaleClient(auth.headscaleUrl, auth.apiKey);
  const { apiKeys } = await headscale.apiKeys.list();
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">API Keys</h1>
      <ApiKeyTable apiKeys={apiKeys} />
    </div>
  );
}
