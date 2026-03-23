import { Truck, ShieldCheck, Phone, RotateCcw } from "lucide-react"
export default function TrustBar() {
const items = [
  { icone: <Truck size={52}/>, titre: "Livraison gratuite", desc: "Dès 500$ d'achat" },
  { icone: <ShieldCheck size={52}/>, titre: "Paiement sécurisé", desc: "Via Stripe" },
  { icone: <Phone size={52}/>, titre: "Service 7j/7", desc: "1-800-ELECTRO" },
  { icone: <RotateCcw size={52}/>, titre: "Retour facile", desc: "30 jours" },
]

// Dans le return, remplacez vos 5 divs par :

    return (
       <section className="bg-white-50 py-6">
  <div className="container mx-auto px-4">
    <div className="grid grid-cols-4 gap-8 justify-items-center">
      {items.map((item) => (
        <div key={item.titre} className="flex items-center gap-3">
          <span className="text-9xl">{item.icone}</span>
          <div>
            <p className="font-bold text-2xl">{item.titre}</p>
            <p className="text-gray-500 text-sm">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
       
    )
}