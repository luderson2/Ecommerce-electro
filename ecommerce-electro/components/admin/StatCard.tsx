import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  sous_label?: string;
  icon: LucideIcon;
  variante?: "default" | "warning" | "success" | "danger";
  href?: string;
}

const varianteStyles = {
  default: {
    card: "border-border",
    icon: "bg-primary/10 text-primary",
  },
  warning: {
    card: "border-burgundy-200 bg-burgundy-50/40",
    icon: "bg-burgundy-100 text-burgundy-700",
  },
  success: {
    card: "border-green-200 bg-green-50/40",
    icon: "bg-green-100 text-green-600",
  },
  danger: {
    card: "border-red-200 bg-red-50/40",
    icon: "bg-red-100 text-red-600",
  },
};

export default function StatCard({
  label,
  value,
  sous_label,
  icon: Icon,
  variante = "default",
  href,
}: StatCardProps) {
  const styles = varianteStyles[variante];

  const content = (
    <div className={cn(
      "bg-white rounded-lg border p-5 flex items-start gap-4 transition-all",
      styles.card,
      href && "hover:shadow-sm hover:-translate-y-px cursor-pointer"
    )}>
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", styles.icon)}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5 leading-tight tabular-nums">{value}</p>
        {sous_label && (
          <p className="text-xs text-muted-foreground mt-1">{sous_label}</p>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
