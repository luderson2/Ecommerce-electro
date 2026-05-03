import { cn } from '@/lib/utils'

interface SectionTitleProps {
  title: string
  subtitle?: string
  className?: string
  align?: 'left' | 'center'
  as?: 'h1' | 'h2'
}

export function SectionTitle({ title, subtitle, className, align = 'left', as: Heading = 'h2' }: SectionTitleProps) {
  return (
    <div className={cn('mb-6', align === 'center' && 'text-center', className)}>
      <Heading className="text-2xl font-semibold text-foreground">{title}</Heading>
      {subtitle && (
        <p className="mt-1 text-muted-foreground">{subtitle}</p>
      )}
    </div>
  )
}
