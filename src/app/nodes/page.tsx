import { getAuthFromCookies } from "@/lib/auth";
import { createHeadscaleClient } from "@/lib/headscale-client";
import { NodeTable } from "@/components/nodes/node-table";

export const dynamic = "force-dynamic";

export default async function NodesPage() {
  const auth = await getAuthFromCookies();
  if (!auth) {
    return <p className="text-muted-foreground">Not authenticated</p>;
  }
  const headscale = createHeadscaleClient(auth.headscaleUrl, auth.apiKey);
  const { nodes } = await headscale.nodes.list();
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Nodes</h1>
      <NodeTable nodes={nodes} />
    </div>
  );
}
