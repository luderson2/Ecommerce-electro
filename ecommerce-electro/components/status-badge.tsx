import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

interface StatusBadgeProps {
  status: OrderStatus
  className?: string
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: 'En attente', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  processing: { label: 'En traitement', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  shipped: { label: 'Expediee', className: 'bg-purple-100 text-purple-800 border-purple-200' },
  delivered: { label: 'Livree', className: 'bg-green-100 text-green-800 border-green-200' },
  cancelled: { label: 'Annulee', className: 'bg-red-100 text-red-800 border-red-200' },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
