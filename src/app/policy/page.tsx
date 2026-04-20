import { headscale } from "@/lib/headscale-client";
import { PolicyEditor } from "@/components/policy/policy-editor";

export const dynamic = "force-dynamic";

export default async function PolicyPage() {
  const { policy, updatedAt } = await headscale.policy.get();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Policy</h1>
        {updatedAt && (
          <span className="text-xs text-muted-foreground">
            Last updated: {new Date(updatedAt).toLocaleString()}
          </span>
        )}
      </div>
      <PolicyEditor initialPolicy={policy} />
    </div>
  );
}