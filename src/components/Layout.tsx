import { NavLink, Outlet } from "react-router-dom";
import { ClipboardList, LayoutDashboard, PlusCircle } from "lucide-react";

const links = [
  { to: "/", label: "Painel", icon: LayoutDashboard },
  { to: "/nova-solicitacao", label: "Nova solicitação", icon: PlusCircle },
  { to: "/demandas", label: "Demandas e triagem", icon: ClipboardList },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-ufms text-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-bold leading-tight">Gestão de Extensão UFMS</h1>
            <p className="text-xs text-blue-100">Atendimento e demandas de projetos de extensão</p>
          </div>
          <nav aria-label="Principal" className="flex flex-wrap gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
                    isActive ? "bg-white text-ufms font-semibold" : "hover:bg-white/10"
                  }`
                }
              >
                <Icon size={16} aria-hidden /> {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t bg-white py-3 text-center text-xs text-slate-500">
        Programa de Extensão UFMS Digital · 95DX7.200525
      </footer>
    </div>
  );
}
