export function LoadingSkeleton({ title }: { title: string }) {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="animate-pulse space-y-3">
        <div className="h-10 w-full rounded-none bg-muted" />
        <div className="h-10 w-full rounded-none bg-muted" />
        <div className="h-10 w-3/4 rounded-none bg-muted" />
      </div>
    </div>
  );
}
