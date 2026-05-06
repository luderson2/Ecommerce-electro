"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DonneesMois {
  mois: string;
  ca: number;
}

interface ChartCAMensuelProps {
  donnees: DonneesMois[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-lg shadow-md px-3 py-2 text-sm">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className="text-primary font-bold">
        {new Intl.NumberFormat("fr-CA", {
          style: "currency",
          currency: "CAD",
          maximumFractionDigits: 0,
        }).format(payload[0].value)}
      </p>
    </div>
  );
}

export default function ChartCAMensuel({ donnees }: ChartCAMensuelProps) {
  if (donnees.length === 0) {
    return (
      <p className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        Aucune donnée disponible.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={donnees} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis
          dataKey="mois"
          tick={{ fontSize: 12, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) =>
            new Intl.NumberFormat("fr-CA", {
              notation: "compact",
              currency: "CAD",
            }).format(v)
          }
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f4f5f7" }} />
        <Bar dataKey="ca" fill="#800020" radius={[4, 4, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}
