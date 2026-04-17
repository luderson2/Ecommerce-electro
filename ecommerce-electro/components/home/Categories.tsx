import { Refrigerator, WashingMachine, Flame, Waves, Microwave } from "lucide-react"

export default function Categories() {
const categories = [
  { nom: "Réfrigérateurs", icone: <Refrigerator size={42}/> },
  { nom: "Laveuses & Sécheuses", icone: <WashingMachine size={42}/> },
  { nom: "Cuisinières", icone: <Flame size={42}/> },
  { nom: "Lave-vaisselles", icone: <Waves size={42}/> },
  { nom: "Micro-ondes", icone: <Microwave size={42}/> },
]

// Dans le return, remplacez vos 5 divs par :

    return (
        <section className="container mx-auto px-4 py-12">
  <h2 className="text-2xl font-bold mb-6">Nos catégories</h2>
  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((cat) => (
                <div key={cat.nom} className="bg-white border border-gray-200 rounded-xl p-6 text-center flex flex-col items-center gap-2 hover:border-primary hover:shadow-md transition cursor-pointer">
                    <span className="text-4xl">{cat.icone}</span>
<p className="font-semibold text-sm">{cat.nom}</p>
                </div>
            ))}
        </div>
</section>
       
    )
}