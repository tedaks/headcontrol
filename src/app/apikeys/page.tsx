import { getAuthFromCookies } from '@/lib/auth';
import { getCachedApiKeys } from '@/lib/server-cache';
import { ApiKeyTable } from '@/components/apikeys/apikey-table';

export const dynamic = 'force-dynamic';

export default async function ApiKeysPage() {
  const auth = await getAuthFromCookies();
  if (!auth) {
    return <p className="text-muted-foreground">Not authenticated</p>;
  }
  const { apiKeys } = await getCachedApiKeys(auth.headscaleUrl, auth.apiKey);
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">API Keys</h1>
      <ApiKeyTable apiKeys={apiKeys} />
    </div>
  );
}
