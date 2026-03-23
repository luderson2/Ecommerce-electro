export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">

      {/* Titre */}
      <div>
        <div className="h-7 w-48 bg-surface rounded-md" />
        <div className="h-4 w-32 bg-surface rounded-md mt-2" />
      </div>

      {/* Barre ou cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-border p-5 h-24" />
        ))}
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="border-b border-border bg-surface px-4 py-3 h-10" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border-b border-border last:border-0 px-4 py-4 flex gap-4">
            <div className="h-4 w-12 bg-surface rounded" />
            <div className="h-4 flex-1 bg-surface rounded" />
            <div className="h-4 w-24 bg-surface rounded" />
            <div className="h-4 w-16 bg-surface rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
