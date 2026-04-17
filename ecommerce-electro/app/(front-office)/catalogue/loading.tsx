export default function CatalogueLoading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      {/* Barre filtres skeleton */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 w-24 bg-surface rounded-full" />
        ))}
      </div>

      {/* Grille produits skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="aspect-square bg-surface" />
            <div className="p-4 space-y-2">
              <div className="h-3 bg-surface rounded w-1/4" />
              <div className="h-5 bg-surface rounded w-3/4" />
              <div className="h-4 bg-surface rounded w-1/2" />
              <div className="h-7 bg-surface rounded w-1/3 mt-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
