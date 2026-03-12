export default function FicheProduitPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{params.slug}</h1>
      {/* TODO: ProductGallery + ProductInfo + ProductSpecs + CrossSelling */}
    </div>
  );
}
