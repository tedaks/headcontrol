import { getAuthFromCookies } from "@/lib/auth";
import { getCachedPolicy } from "@/lib/server-cache";
import { PolicyEditor } from "@/components/policy/policy-editor";

export const dynamic = "force-dynamic";

export default async function PolicyPage() {
  const auth = await getAuthFromCookies();
  if (!auth) {
    return <p className="text-muted-foreground">Not authenticated</p>;
  }
  const { policy, updatedAt } = await getCachedPolicy(auth.headscaleUrl, auth.apiKey);
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
