import { getAuthFromCookies } from '@/lib/auth';
import { getCachedNodes } from '@/lib/server-cache';
import { NodeTable } from '@/components/nodes/node-table';

export const dynamic = 'force-dynamic';

export default async function NodesPage() {
  const auth = await getAuthFromCookies();
  if (!auth) {
    return <p className="text-muted-foreground">Not authenticated</p>;
  }
  const { nodes } = await getCachedNodes(auth.headscaleUrl, auth.apiKey);
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Nodes</h1>
      <NodeTable nodes={nodes} />
    </div>
  );
}
