import { Button } from "@/components/ui/button";
import Link from "next/link";


export default function Hero() {
    return (
        <section className="bg-primary min-h-[500px] container mx-auto px-25 py-20 my-12 rounded-2xl mb-12 items-center">
            <div className="container mx-auto px-4 grid grid-cols-2 items-center gap-2">
                <div className="pt-10">
                <h1 className="text-6xl font-bold mb-4 text-white">Bienvenue chez ElectroMétropolitain</h1>
                <p className="text-lg text-white/70 mb-6">Votre destination électroménagers au Québec</p>
                <Link href="/catalogue">
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg rounded-xl">
  Magasiner maintenant
</Button>
                </Link>
                </div>
              
            </div>
        </section>
    )
}
