export default function PacksLoading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="h-7 w-40 bg-surface rounded-md mb-2" />
      <div className="h-4 w-64 bg-surface rounded-md mb-8" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="h-36 bg-surface" />
            <div className="p-5 space-y-3">
              <div className="h-4 bg-surface rounded w-1/4" />
              <div className="h-5 bg-surface rounded w-3/4" />
              <div className="h-4 bg-surface rounded w-full" />
              <div className="h-8 bg-surface rounded w-1/3 mt-2" />
              <div className="h-10 bg-surface rounded w-full mt-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
