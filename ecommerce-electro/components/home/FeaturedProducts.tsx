import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/catalogue/ProductCard"

export default function FeaturedProducts() {

    const produits = [
        { nom: "Réfrigérateur Samsung", marque: "Samsung", prix: 1299 },
        { nom: "Laveuse LG", marque: "LG", prix: 899 },
        { nom: "Cuisinière Frigidaire", marque: "Frigidaire", prix: 749 },
        { nom: "Lave-vaisselle Bosch", marque: "Bosch", prix: 999 },
    ]
    return (
        <div className="container mx-auto px-1 py-12">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Produits vedettes</h2>
            <Link href="/catalogue" className="text-orange-500 hover:underline text-sm font-semibold">
                Voir tout →
            </Link>


        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {produits.map((prod) => (
                <ProductCard key={prod.nom} nom={prod.nom} marque={prod.marque} prix={prod.prix} />
            ))}
        </div>
        </div>
    )
}