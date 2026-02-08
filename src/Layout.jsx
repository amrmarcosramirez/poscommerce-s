import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LayoutDashboard, ShoppingCart, Package, Users, FileText, Settings as SettingsIcon, Store, TrendingUp, Globe, Info, Folder, Award, BarChart3 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { base44 } from "@/api/base44Client";
import { LogOut } from "lucide-react";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "POS - Tienda Física",
    url: createPageUrl("POS"),
    icon: ShoppingCart,
  },
  {
    title: "eCommerce",
    url: createPageUrl("eCommerce"),
    icon: Globe,
  },
  {
    title: "Productos",
    url: createPageUrl("Products"),
    icon: Package,
  },
  {
    title: "Categorías",
    url: createPageUrl("Categories"),
    icon: Folder,
  },
  {
    title: "Ventas",
    url: createPageUrl("Sales"),
    icon: TrendingUp,
  },
  {
    title: "Clientes",
    url: createPageUrl("Customers"),
    icon: Users,
  },
  {
    title: "Equipo",
    url: createPageUrl("TeamMembers"),
    icon: Users,
  },
  {
    title: "Fidelización",
    url: createPageUrl("Loyalty"),
    icon: Award,
  },
  {
    title: "Facturas",
    url: createPageUrl("Invoices"),
    icon: FileText,
  },
  {
    title: "Reportes",
    url: createPageUrl("Reports"),
    icon: BarChart3,
  },
  {
    title: "Tiendas",
    url: createPageUrl("Stores"),
    icon: Store,
  },
  {
    title: "Configuración",
    url: createPageUrl("Settings"),
    icon: SettingsIcon,
  },
];

//const PAGES_WITHOUT_LAYOUT = ["Landing", "TrialExpired", "Onboarding"];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [config, setConfig] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    base44.entities.BusinessConfig.list().then(configs => {
      if (configs.length > 0) setConfig(configs[0]);
    }).catch(() => {});
  }, []);

  // Páginas sin layout (Landing, TrialExpired)
  /*if (PAGES_WITHOUT_LAYOUT.includes(currentPageName)) {
    return children;
  }*/

  const businessName = config?.business_name || "POSCommerce";
  const businessLogo = config?.logo_url || null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
        <style>{`
          :root {
            --primary: 210 100% 45%;
            --primary-dark: 210 100% 35%;
            --success: 158 64% 52%;
            --sidebar-background: 220 13% 18%;
            --sidebar-foreground: 220 9% 85%;
          }
        `}</style>
        
        <Sidebar className="border-r-0 shadow-xl" style={{ backgroundColor: 'hsl(var(--sidebar-background))' }}>
          <SidebarHeader className="border-b border-white/10 p-6">
            <div className="flex items-center gap-3">
              {businessLogo ? (
                <img src={businessLogo} alt="Logo" className="w-10 h-10 object-contain rounded-xl" />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Store className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h2 className="font-bold text-lg text-white">{businessName}</h2>
                <p className="text-xs text-slate-400">Sistema POS + eCommerce</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
                Gestión
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`mb-1 rounded-lg transition-all duration-200 ${
                            isActive 
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                              : 'text-slate-300 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5">
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
                Ayuda
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="text-slate-300 hover:bg-white/10 hover:text-white rounded-lg">
                      <Link to={createPageUrl("eCommerceInfo")} className="flex items-center gap-3 px-3 py-2.5">
                        <Info className="w-5 h-5" />
                        <span className="font-medium">¿Qué es eCommerce?</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-white/10 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 w-full hover:bg-white/5 rounded-lg p-2 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">
                      {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-medium text-white text-sm truncate">
                      {user?.full_name || 'Usuario'}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{user?.email || ''}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem 
                  onClick={() => base44.auth.logout()}
                  className="text-red-600 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 lg:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors" />
              <h1 className="text-xl font-bold text-slate-900">{businessName}</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}