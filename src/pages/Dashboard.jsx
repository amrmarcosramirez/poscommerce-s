import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Euro, TrendingUp, Package, Users, ShoppingCart, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import StatsCard from "../components/dashboard/StatsCard";
import SalesChart from "../components/dashboard/SalesChart";
import RecentSales from "../components/dashboard/RecentSales";
import LowStockAlert from "../components/dashboard/LowStockAlert";
import TopProducts from "../components/dashboard/TopProducts";
import TrialBanner from "../components/trial/TrialBanner";

export default function Dashboard() {
  const { data: config, isLoading: loadingConfig } = useQuery({
    queryKey: ['businessConfig'],
    queryFn: async () => {
      const configs = await base44.entities.BusinessConfig.list();
      return configs[0] || null;
    },
  });

  const { data: sales = [], isLoading: loadingSales } = useQuery({
    queryKey: ['sales'],
    queryFn: () => base44.entities.Sale.list('-sale_date', 100),
  });

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list(),
  });

  // Redirigir al onboarding si no está configurado
  React.useEffect(() => {
    if (!loadingConfig && (!config || !config.onboarding_completed)) {
      window.location.href = createPageUrl("Onboarding");
    }
  }, [config, loadingConfig]);

  // Verificar si el trial ha expirado
  React.useEffect(() => {
    if (config && config.subscription_status === "trial" && config.trial_ends_at) {
      const trialEnded = new Date(config.trial_ends_at) < new Date();
      if (trialEnded) {
        window.location.href = createPageUrl("TrialExpired");
      }
    }
  }, [config]);

  // Calcular métricas
  const thisMonthSales = sales.filter(sale => {
    const saleDate = new Date(sale.sale_date);
    const now = new Date();
    return saleDate >= startOfMonth(now) && saleDate <= endOfMonth(now);
  });

  const lastMonthSales = sales.filter(sale => {
    const saleDate = new Date(sale.sale_date);
    const lastMonth = subMonths(new Date(), 1);
    return saleDate >= startOfMonth(lastMonth) && saleDate <= endOfMonth(lastMonth);
  });

  const totalRevenue = thisMonthSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
  const lastMonthRevenue = lastMonthSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
  const revenueGrowth = lastMonthRevenue > 0 
    ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
    : 0;

  const lowStockProducts = products.filter(p => p.stock <= p.min_stock && p.is_active);

  if (loadingConfig || !config) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <TrialBanner config={config} />
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">
            Resumen de tu negocio - {format(new Date(), "MMMM yyyy", { locale: es })}
          </p>
        </div>
        <Link to={createPageUrl("POS")}>
          <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all duration-200 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Abrir Punto de Venta
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Ventas del Mes"
          value={`${totalRevenue.toFixed(2)}€`}
          icon={Euro}
          trend={revenueGrowth}
          trendLabel={`vs mes anterior`}
          gradient="from-blue-500 to-blue-600"
        />
        <StatsCard
          title="Pedidos"
          value={thisMonthSales.length}
          icon={ShoppingCart}
          gradient="from-green-500 to-green-600"
        />
        <StatsCard
          title="Productos"
          value={products.length}
          subtitle={`${products.filter(p => p.is_active).length} activos`}
          icon={Package}
          gradient="from-purple-500 to-purple-600"
        />
        <StatsCard
          title="Clientes"
          value={customers.length}
          icon={Users}
          gradient="from-orange-500 to-orange-600"
        />
      </div>

      {lowStockProducts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <AlertCircle className="w-5 h-5" />
              Alerta de Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LowStockAlert products={lowStockProducts} />
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart sales={sales} isLoading={loadingSales} />
        </div>
        <div>
          <TopProducts sales={sales} products={products} />
        </div>
      </div>

      <RecentSales sales={sales.slice(0, 10)} isLoading={loadingSales} />
    </div>
  );
}