"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X }  from "lucide-react"

type Produit = {
  id: number
  nom: string
  marque: string
  prix: number
  specs: {
    dimensions: string
    capacite: string
    consommation: string
    garantie: string
    couleur: string
    wifi: boolean
  }
}

const produitsDisponibles: Produit[] = [
  {
    id: 1, nom: "Réfrigérateur Samsung", marque: "Samsung", prix: 1299,
    specs: { dimensions: "70 x 178 x 75 cm", capacite: "28 pi³", consommation: "450 kWh/an", garantie: "2 ans", couleur: "Acier inox", wifi: true }
  },
  {
    id: 2, nom: "Réfrigérateur LG", marque: "LG", prix: 1599,
    specs: { dimensions: "68 x 180 x 74 cm", capacite: "30 pi³", consommation: "420 kWh/an", garantie: "3 ans", couleur: "Noir mat", wifi: true }
  },
  {
    id: 3, nom: "Réfrigérateur Whirlpool", marque: "Whirlpool", prix: 899,
    specs: { dimensions: "65 x 170 x 70 cm", capacite: "24 pi³", consommation: "480 kWh/an", garantie: "1 an", couleur: "Blanc", wifi: false }
  },
  {
    id: 4, nom: "Laveuse LG", marque: "LG", prix: 899,
    specs: { dimensions: "60 x 85 x 65 cm", capacite: "5.0 pi³", consommation: "120 kWh/an", garantie: "2 ans", couleur: "Blanc", wifi: true }
  },
]

const attributs = [
  { label: "Prix", key: "prix" },
  { label: "Dimensions", key: "specs.dimensions" },
  { label: "Capacité", key: "specs.capacite" },
  { label: "Consommation", key: "specs.consommation" },
  { label: "Garantie", key: "specs.garantie" },
  { label: "Couleur", key: "specs.couleur" },
  { label: "Wi-Fi", key: "specs.wifi" },
]

function getVal(produit: Produit, key: string): string {
  if (key === "prix") return produit.prix.toLocaleString("fr-CA") + " $"
  if (key.startsWith("specs.")) {
    const k = key.replace("specs.", "") as keyof typeof produit.specs
    const val = produit.specs[k]
    if (typeof val === "boolean") return val ? "✅ Oui" : "❌ Non"
    return String(val)
  }
  return ""
}

export default function Comparateur() {
  const [selectionnes, setSelectionnes] = useState<Produit[]>([])

  function ajouterProduit(produit: Produit) {
    if (selectionnes.length >= 4) return
    if (selectionnes.find(p => p.id === produit.id)) return
    setSelectionnes([...selectionnes, produit])
  }

  function retirerProduit(id: number) {
    setSelectionnes(selectionnes.filter(p => p.id !== id))
  }

  return (
    <div className="py-8">
      {/* Sélection produits */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-3">Choisissez jusqu'à 4 produits</h2>
        <div className="flex gap-3 flex-wrap">
          {produitsDisponibles.map(p => (
            <button
              key={p.id}
              onClick={() => ajouterProduit(p)}
              disabled={!!selectionnes.find(s => s.id === p.id)}
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm hover:border-primary transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {p.nom}
            </button>
          ))}
        </div>
      </div>

      {selectionnes.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Sélectionnez des produits ci-dessus pour les comparer</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {/* Colonne vide pour les labels */}
                <th className="w-40"/>
                {selectionnes.map(p => (
                  <th key={p.id} className="p-4 border border-gray-100 bg-gray-50 min-w-48">
                    <div className="bg-gray-100 h-32 rounded-lg mb-3 flex items-center justify-center text-gray-400 text-xs">Image</div>
                    <p className="text-xs text-gray-500 uppercase">{p.marque}</p>
                    <p className="font-bold text-sm">{p.nom}</p>
                    <button onClick={() => retirerProduit(p.id)} className="mt-2 text-gray-400 hover:text-red-500 transition">
                      <X size={16}/>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attributs.map((attr, i) => {
                const valeurs = selectionnes.map(p => getVal(p, attr.key))
                const toutesPareil = valeurs.every(v => v === valeurs[0])
                return (
                  <tr key={attr.key} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="p-4 text-sm font-semibold text-gray-600 border border-gray-100">{attr.label}</td>
                    {selectionnes.map(p => (
                      <td key={p.id} className={`p-4 text-sm text-center border border-gray-100 ${!toutesPareil ? "font-bold text-primary" : ""}`}>
                        {getVal(p, attr.key)}
                      </td>
                    ))}
                  </tr>
                )
              })}
              {/* Ligne boutons */}
              <tr className="bg-white">
                <td className="p-4 border border-gray-100"/>
                {selectionnes.map(p => (
                  <td key={p.id} className="p-4 border border-gray-100 text-center">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-sm">
                      Ajouter au panier
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}