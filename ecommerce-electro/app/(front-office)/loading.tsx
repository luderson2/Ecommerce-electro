export default function FrontOfficeLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <div className="bg-primary/20 h-64 md:h-80" />

      {/* Grille de cards skeleton */}
      <div className="container mx-auto px-4 py-12">
        <div className="h-7 w-48 bg-surface rounded-md mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="aspect-square bg-surface" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-surface rounded w-3/4" />
                <div className="h-4 bg-surface rounded w-1/2" />
                <div className="h-6 bg-surface rounded w-1/3 mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
