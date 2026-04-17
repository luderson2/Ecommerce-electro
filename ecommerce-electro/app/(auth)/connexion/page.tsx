import { Suspense } from "react";
import ConnexionForm from "./ConnexionForm";

export default function ConnexionPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl mb-4">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Connexion</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Accédez à votre espace ElectroMétropolitain
          </p>
        </div>
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
          <Suspense>
            <ConnexionForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
