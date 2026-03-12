export default function CategoriePage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold capitalize">{params.slug}</h1>
      {/* TODO: ProductGrid filtered by category */}
    </div>
  );
}
