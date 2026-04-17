import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type Produit = {
  nom: string
  prix: number
}

type Props = {
  nom: string
  description: string
  economie: number
  prix: number
  prixOriginal: number
  produits: Produit[]
}

export default function PackCard({ nom, description, economie, prix, prixOriginal, produits }: Props) {
  return (
    <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition">
      
      {/* En-tête */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold">{nom}</h3>
          <p className="text-gray-500 text-sm mt-1">{description}</p>
        </div>
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          Économisez {economie}%
        </Badge>
      </div>

      {/* Produits avec + */}
      <div className="flex items-center justify-center gap-4 mb-6">
        {produits.map((produit, index) => (
          <div key={produit.nom} className="flex items-center gap-4">
            <div className="text-center">
              <div className="bg-gray-100 w-32 h-32 rounded-xl flex items-center justify-center mb-2">
                <span className="text-gray-400 text-xs">Image</span>
              </div>
              <p className="text-sm font-medium">{produit.nom}</p>
              <p className="text-sm text-gray-500">{produit.prix.toLocaleString("fr-CA")} $</p>
            </div>
            {index < produits.length - 1 && (
              <span className="text-2xl text-gray-400 font-light">+</span>
            )}
          </div>
        ))}
      </div>

      {/* Résumé prix */}
      <div className="border-t pt-4 flex justify-between items-center">
        <div className="flex gap-6">
          <div>
            <p className="text-xs text-gray-500">Prix séparé</p>
            <p className="line-through text-gray-400">{prixOriginal.toLocaleString("fr-CA")} $</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Vous économisez</p>
            <p className="text-green-600 font-bold">{(prixOriginal - prix).toLocaleString("fr-CA")} $</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Prix du pack</p>
            <p className="text-orange-500 font-bold text-xl">{prix.toLocaleString("fr-CA")} $</p>
          </div>
        </div>
        <Button className="bg-primary hover:bg-primary/90 px-8">
          Ajouter au panier →
        </Button>
      </div>

    </div>
  )
}