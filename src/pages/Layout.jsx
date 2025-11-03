import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap,
  FileText,
  Settings,
  Menu
} from "lucide-react";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Containers",
    url: createPageUrl("Containers"),
    icon: GraduationCap,
  },
  {
    title: "Disciplinas",
    url: createPageUrl("Series"),
    icon: BookOpen,
  },
  {
    title: "Componentes",
    url: createPageUrl("Components"),
    icon: FileText,
  },
];

export default function Layout({ children }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Top Navigation Bar */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand - Apenas Texto */}
            <div className="flex items-center gap-3">
              <div>
                <h2 className="font-bold text-slate-900 text-xl">Matrix</h2>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <Link
                    key={item.title}
                    to={item.url}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : 'text-slate-500'}`} />
                    <span className="font-medium text-sm">{item.title}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Section - User & Settings */}
            <div className="flex items-center gap-3">
              <button className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors">
                <Settings className="w-5 h-5 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">Configurações</span>
              </button>

              {/* User Info - Apenas Texto */}
              <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50">
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Usuário</p>
                  <p className="text-xs text-slate-500">Coordenador</p>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button 
                className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="w-6 h-6 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200">
              <nav className="flex flex-col gap-1">
                {navigationItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <Link
                      key={item.title}
                      to={item.url}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive 
                          ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700' 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : 'text-slate-500'}`} />
                      <span className="font-medium text-sm">{item.title}</span>
                    </Link>
                  );
                })}
                <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
                  <Settings className="w-5 h-5 text-slate-500" />
                  <span className="font-medium text-sm">Configurações</span>
                </button>
              </nav>
              
              {/* Mobile User Info */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Usuário</p>
                    <p className="text-xs text-slate-500">Coordenador Acadêmico</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
