export default function RecherchePage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">
        Résultats pour &ldquo;{searchParams.q}&rdquo;
      </h1>
      {/* TODO: SearchResults */}
    </div>
  );
}
