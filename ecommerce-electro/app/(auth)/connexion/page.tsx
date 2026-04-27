import { Suspense } from "react";
import ConnexionForm from "./ConnexionForm";

function ConnexionFallback() {
  return (
    <div className="flex items-center justify-center py-8">
      <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <span className="text-lg font-bold text-white">E</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Connexion</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Accedez a votre espace ElectroMetropolitain
          </p>
        </div>
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <Suspense fallback={<ConnexionFallback />}>
            <ConnexionForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
