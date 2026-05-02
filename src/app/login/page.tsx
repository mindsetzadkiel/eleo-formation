"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Monitor, LogIn } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur de connexion");
        return;
      }

      if (data.user.role === "ADMIN" || data.user.role === "FORMATEUR") {
        router.push("/admin");
      } else if (data.user.role === "APPRENANT") {
        router.push("/learn");
      } else {
        router.push("/admin");
      }
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-eleo-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Monitor className="w-8 h-8 text-eleo-500" />
            <span className="text-2xl font-bold text-eleo-gray-800">Eleo Formation</span>
          </Link>
          <p className="text-eleo-gray-500">Connectez-vous à votre espace</p>
        </div>

        <div className="bg-white shadow-md border border-eleo-gray-200 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@eleo.local"
            />
            <Input
              label="Mot de passe"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Connexion..." : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Se connecter
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-eleo-gray-400 mt-4">
          <Link href="/" className="hover:text-eleo-500">&larr; Retour au site</Link>
        </p>
      </div>
    </div>
  );
}
