export default async function EditProduitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Modifier le produit</h1>
      <p className="text-sm text-muted mt-1">ID : {id}</p>
    </div>
  );
}
