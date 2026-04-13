import { createClient } from '@/lib/supabase/server'
import { Package, Clock, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'

export default async function OrdersPage() {
  const supabase = await createClient()
  

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Vous devez être connecté pour voir vos commandes.</div>
  }

  
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return <div>Erreur lors du chargement des commandes.</div>

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Mes Commandes</h1>

      {orders?.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-xl">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p>Vous n'avez pas encore passé de commande.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders?.map((order) => (
            <div key={order.id} className="border rounded-xl p-6 bg-white shadow-sm">
              <div className="flex justify-between items-center mb-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-muted-foreground">Commande #{order.id.slice(0, 8)}</p>
                  <p className="text-sm font-medium">
                    {new Date(order.created_at).toLocaleDateString('fr-CA')}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    order.status === 'payee' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <p className="font-bold mt-1">{order.total_amount}$</p>
                </div>
              </div>

              
              <div className="space-y-3">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 text-sm">
                    <div className="relative h-12 w-12 border rounded">
                      <Image 
                        src={item.product_image || '/placeholder.svg'} 
                        alt={item.product_name} 
                        fill 
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-muted-foreground">Qté: {item.quantity}</p>
                    </div>
                    <p className="font-medium">{item.unit_price}$</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}