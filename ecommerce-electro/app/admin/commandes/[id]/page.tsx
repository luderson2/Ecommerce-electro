export default async function AdminCommandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Commande #{id}</h1>
    </div>
  );
}
