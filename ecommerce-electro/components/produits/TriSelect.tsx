"use client";

import { useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { value: "recents", label: "Les plus récents" },
  { value: "prix_asc", label: "Prix croissant" },
  { value: "prix_desc", label: "Prix décroissant" },
];

export default function TriSelect({ tri }: { tri: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value === "recents") {
      params.delete("tri");
    } else {
      params.set("tri", e.target.value);
    }
    router.push(`/catalogue?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="tri" className="text-xs text-muted-foreground font-medium whitespace-nowrap">
        Trier par
      </label>
      <select
        id="tri"
        value={tri}
        onChange={handleChange}
        className="text-sm border border-border rounded-md px-2 py-1.5 bg-white text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary cursor-pointer"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
