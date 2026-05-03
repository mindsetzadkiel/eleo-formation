"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  GraduationCap,
  CalendarDays,
  Users,
  Building2,
  UserCheck,
  FileText,
  ClipboardCheck,
  ClipboardList,
  Bot,
  Mail,
  LogOut,
  Monitor,
  Wrench,
  MessageSquareWarning,
  TrendingUp,
  FileSpreadsheet,
  ScrollText,
} from "lucide-react";

const menuItems = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/formations", label: "Formations", icon: GraduationCap },
  { href: "/admin/sessions", label: "Sessions", icon: CalendarDays },
  { href: "/admin/apprenants", label: "Apprenants", icon: Users },
  { href: "/admin/entreprises", label: "Entreprises", icon: Building2 },
  { href: "/admin/crm", label: "CRM Prospects", icon: UserCheck },
  { href: "/admin/opco", label: "Dossiers OPCO", icon: FileText },
  { href: "/admin/qualiopi", label: "Cockpit Qualiopi", icon: ClipboardCheck },
  { href: "/admin/positionnement", label: "Positionnement", icon: ClipboardList },
  { href: "/admin/reclamations", label: "Réclamations", icon: MessageSquareWarning },
  { href: "/admin/reglement", label: "Règlement intérieur", icon: ScrollText },
  { href: "/admin/indicateurs", label: "Indicateurs résultats", icon: TrendingUp },
  { href: "/admin/bpf", label: "BPF annuel", icon: FileSpreadsheet },
  { href: "/admin/ateliers", label: "Ateliers", icon: Wrench },
  { href: "/admin/emails", label: "Modèles emails", icon: Mail },
  { href: "/admin/assistant", label: "Assistant IA", icon: Bot },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-30 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="px-4 py-5 border-b border-slate-800">
        <Link href="/admin" className="flex items-center gap-2">
          <Monitor className="w-7 h-7 text-cyan-400" />
          <div>
            <div className="text-sm font-bold text-white">Eleo Formation</div>
            <div className="text-xs text-slate-400">Administration</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-cyan-600/20 text-cyan-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-800">
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
          <Monitor className="w-5 h-5" />
          Site public
        </Link>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </form>
      </div>
    </aside>
  );
}
