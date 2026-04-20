import { headscale } from "@/lib/headscale-client";
import { NodeTable } from "@/components/nodes/node-table";

export const dynamic = "force-dynamic";

export default async function NodesPage() {
  const { nodes } = await headscale.nodes.list();
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Nodes</h1>
      <NodeTable nodes={nodes} />
    </div>
  );
}
