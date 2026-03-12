export default function CommandeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Commande #{params.id}</h1>
      {/* TODO: OrderDetail + DeliveryStatus */}
    </div>
  );
}
