"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Monitor } from "lucide-react";
import { COMPANY } from "@/config/company";

const navItems = [
  { href: "/", label: "Accueil" },
  { href: "/formations", label: "Formations" },
  { href: "/devis", label: "Demande de devis" },
  { href: "/contact", label: "Contact" },
  { href: "/conditions-accueil", label: "Conditions d'accueil" },
];

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-eleo-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Monitor className="w-7 h-7 text-eleo-500" />
            <div>
              <span className="text-lg font-bold text-eleo-gray-700">{COMPANY.brandName}</span>
              <span className="hidden sm:inline text-xs text-eleo-gray-500 ml-2">par {COMPANY.name}</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-eleo-gray-600 hover:text-eleo-500 hover:bg-eleo-50 rounded-lg transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="ml-3 px-4 py-2 text-sm font-medium text-white bg-eleo-orange-500 hover:bg-eleo-orange-600 rounded-lg transition-colors shadow-sm"
            >
              Espace privé
            </Link>
          </nav>

          <button
            className="md:hidden p-2 text-eleo-gray-600 hover:text-eleo-500"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileOpen && (
          <nav className="md:hidden pb-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 text-sm font-medium text-eleo-gray-600 hover:text-eleo-500 hover:bg-eleo-50 rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="block px-3 py-2 text-sm font-medium text-eleo-orange-500 hover:text-eleo-orange-600"
              onClick={() => setMobileOpen(false)}
            >
              Espace privé
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
