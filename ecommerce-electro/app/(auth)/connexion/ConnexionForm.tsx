"use client";

import { useActionState } from "react";
import { seConnecter } from "@/lib/actions/auth";

export default function ConnexionForm() {
  const [state, formAction, isPending] = useActionState(seConnecter, null);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
          Adresse courriel
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="admin@electrometropolitain.ca"
          className="w-full px-3 py-2.5 border border-border rounded-md text-sm bg-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="w-full px-3 py-2.5 border border-border rounded-md text-sm bg-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary text-white py-2.5 rounded-md text-sm font-medium hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-2"
      >
        {isPending ? "Connexion en cours…" : "Se connecter"}
      </button>
    </form>
  );
}
