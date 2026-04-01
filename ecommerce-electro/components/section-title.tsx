import { cn } from '@/lib/utils'

interface SectionTitleProps {
  title: string
  subtitle?: string
  className?: string
  align?: 'left' | 'center'
}

export function SectionTitle({ title, subtitle, className, align = 'left' }: SectionTitleProps) {
  return (
    <div className={cn('mb-6', align === 'center' && 'text-center', className)}>
      <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
      {subtitle && (
        <p className="mt-1 text-muted-foreground">{subtitle}</p>
      )}
    </div>
  )
}
