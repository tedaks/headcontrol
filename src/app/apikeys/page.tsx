import { headscale } from "@/lib/headscale-client";
import { ApiKeyTable } from "@/components/apikeys/apikey-table";

export const dynamic = "force-dynamic";

export default async function ApiKeysPage() {
  const { apiKeys } = await headscale.apiKeys.list();
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">API Keys</h1>
      <ApiKeyTable apiKeys={apiKeys} />
    </div>
  );
}
