import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, TrendingUp, Calendar, Euro, FileSpreadsheet } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

export default function Reports() {
  const [dateRange, setDateRange] = useState("this_month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedStore, setSelectedStore] = useState("all");

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: () => base44.entities.Sale.list('-sale_date'),
  });

  const { data: stores = [] } = useQuery({
    queryKey: ['stores'],
    queryFn: () => base44.entities.Store.list(),
  });

  const getDateRangeFilter = () => {
    const now = new Date();
    let start, end;

    switch(dateRange) {
      case 'this_month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'this_year':
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      case 'custom':
        if (!startDate || !endDate) return null;
        start = new Date(startDate);
        end = new Date(endDate);
        break;
      default:
        start = startOfMonth(now);
        end = endOfMonth(now);
    }

    return { start, end };
  };

  const filterSalesByDate = (salesList) => {
    const range = getDateRangeFilter();
    if (!range) return salesList;

    return salesList.filter(sale => {
      const saleDate = new Date(sale.sale_date);
      return saleDate >= range.start && saleDate <= range.end;
    });
  };

  const filteredSales = filterSalesByDate(sales).filter(sale => 
    selectedStore === "all" || sale.store_id === selectedStore
  );

  // Calcular IVA por tipo
  const ivaBreakdown = filteredSales.reduce((acc, sale) => {
    sale.items?.forEach(item => {
      const rate = item.iva_rate || 21;
      if (!acc[rate]) {
        acc[rate] = { base: 0, iva: 0, total: 0 };
      }
      const itemBase = item.subtotal || 0;
      const itemIva = itemBase * (rate / 100);
      acc[rate].base += itemBase;
      acc[rate].iva += itemIva;
      acc[rate].total += itemBase + itemIva;
    });
    return acc;
  }, {});

  const totalBase = Object.values(ivaBreakdown).reduce((sum, v) => sum + v.base, 0);
  const totalIva = Object.values(ivaBreakdown).reduce((sum, v) => sum + v.iva, 0);
  const totalWithIva = totalBase + totalIva;

  // Ventas por canal
  const salesByChannel = filteredSales.reduce((acc, sale) => {
    const channel = sale.channel || 'tienda_fisica';
    if (!acc[channel]) {
      acc[channel] = { count: 0, total: 0 };
    }
    acc[channel].count++;
    acc[channel].total += sale.total || 0;
    return acc;
  }, {});

  // Ventas por método de pago
  const salesByPayment = filteredSales.reduce((acc, sale) => {
    const method = sale.payment_method || 'efectivo';
    if (!acc[method]) {
      acc[method] = { count: 0, total: 0 };
    }
    acc[method].count++;
    acc[method].total += sale.total || 0;
    return acc;
  }, {});

  // Productos más vendidos
  const productSales = filteredSales.reduce((acc, sale) => {
    sale.items?.forEach(item => {
      const key = item.product_name || 'Desconocido';
      if (!acc[key]) {
        acc[key] = { quantity: 0, revenue: 0 };
      }
      acc[key].quantity += item.quantity || 0;
      acc[key].revenue += item.subtotal || 0;
    });
    return acc;
  }, {});

  const topProducts = Object.entries(productSales)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const exportToCSV = () => {
    const headers = ['Fecha', 'Número', 'Cliente', 'Base', 'IVA', 'Total', 'Método Pago', 'Canal'];
    const rows = filteredSales.map(sale => [
      format(new Date(sale.sale_date), 'dd/MM/yyyy', { locale: es }),
      sale.sale_number,
      sale.customer_name,
      sale.subtotal?.toFixed(2) || '0.00',
      sale.total_iva?.toFixed(2) || '0.00',
      sale.total?.toFixed(2) || '0.00',
      sale.payment_method,
      sale.channel === 'ecommerce' ? 'Online' : 'Física'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_ventas_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    toast.success('Reporte exportado correctamente');
  };

  const exportIVAReport = () => {
    const headers = ['Tipo IVA', 'Base Imponible', 'Cuota IVA', 'Total'];
    const rows = Object.entries(ivaBreakdown).map(([rate, data]) => [
      `${rate}%`,
      data.base.toFixed(2),
      data.iva.toFixed(2),
      data.total.toFixed(2)
    ]);
    rows.push(['TOTAL', totalBase.toFixed(2), totalIva.toFixed(2), totalWithIva.toFixed(2)]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_iva_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    toast.success('Reporte de IVA exportado correctamente');
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-8 h-8" />
            Reportes y Analítica
          </h1>
          <p className="text-slate-600 mt-1">Informes fiscales y de negocio</p>
        </div>

        {/* Filtros */}
        <Card className="shadow-lg border-0 mb-6">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Periodo</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="this_month">Este Mes</SelectItem>
                    <SelectItem value="this_year">Este Año</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dateRange === 'custom' && (
                <>
                  <div className="space-y-2">
                    <Label>Desde</Label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Hasta</Label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Tienda</Label>
                <Select value={selectedStore} onValueChange={setSelectedStore}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las tiendas</SelectItem>
                    {stores.map(store => (
                      <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumen General */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Ventas Totales</p>
                  <p className="text-3xl font-bold text-blue-600">{filteredSales.length}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Base Imponible</p>
                  <p className="text-3xl font-bold text-green-600">{totalBase.toFixed(2)}€</p>
                </div>
                <Euro className="w-12 h-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total con IVA</p>
                  <p className="text-3xl font-bold text-purple-600">{totalWithIva.toFixed(2)}€</p>
                </div>
                <Calendar className="w-12 h-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Desglose de IVA */}
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center justify-between">
                <span>Desglose de IVA</span>
                <Button onClick={exportIVAReport} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo IVA</TableHead>
                    <TableHead className="text-right">Base</TableHead>
                    <TableHead className="text-right">Cuota</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(ivaBreakdown).map(([rate, data]) => (
                    <TableRow key={rate}>
                      <TableCell className="font-medium">{rate}%</TableCell>
                      <TableCell className="text-right">{data.base.toFixed(2)}€</TableCell>
                      <TableCell className="text-right">{data.iva.toFixed(2)}€</TableCell>
                      <TableCell className="text-right font-semibold">{data.total.toFixed(2)}€</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-slate-50 font-bold">
                    <TableCell>TOTAL</TableCell>
                    <TableCell className="text-right">{totalBase.toFixed(2)}€</TableCell>
                    <TableCell className="text-right">{totalIva.toFixed(2)}€</TableCell>
                    <TableCell className="text-right text-green-600">{totalWithIva.toFixed(2)}€</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Ventas por Canal */}
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b">
              <CardTitle>Ventas por Canal</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {Object.entries(salesByChannel).map(([channel, data]) => (
                  <div key={channel} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium">
                        {channel === 'ecommerce' ? '🌐 Tienda Online' : '🏪 Tienda Física'}
                      </p>
                      <p className="text-sm text-slate-600">{data.count} ventas</p>
                    </div>
                    <p className="text-xl font-bold text-blue-600">{data.total.toFixed(2)}€</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Ventas por Método de Pago */}
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b">
              <CardTitle>Ventas por Método de Pago</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {Object.entries(salesByPayment).map(([method, data]) => (
                  <div key={method} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium capitalize">{method}</p>
                      <p className="text-sm text-slate-600">{data.count} transacciones</p>
                    </div>
                    <p className="text-lg font-bold text-green-600">{data.total.toFixed(2)}€</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Productos */}
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b">
              <CardTitle>Top 10 Productos</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-400 w-6">#{index + 1}</span>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.quantity} unidades</p>
                      </div>
                    </div>
                    <p className="font-bold text-blue-600">{product.revenue.toFixed(2)}€</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botones de Exportación */}
        <Card className="shadow-lg border-0">
          <CardHeader className="border-b">
            <CardTitle>Exportar Reportes</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-4 flex-wrap">
              <Button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700">
                <FileSpreadsheet className="w-5 h-5 mr-2" />
                Exportar Ventas (CSV)
              </Button>
              <Button onClick={exportIVAReport} variant="outline">
                <Download className="w-5 h-5 mr-2" />
                Exportar IVA (CSV)
              </Button>
            </div>
            <p className="text-sm text-slate-500 mt-4">
              📊 Los archivos CSV pueden abrirse en Excel o importarse en tu software de contabilidad
            </p>
          </CardContent>
        </Card>

        {/* Nota Legal */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Cumplimiento Fiscal</h3>
          <p className="text-sm text-blue-800">
            Estos reportes están diseñados para cumplir con la normativa española de la AEAT. 
            Los desgloses de IVA son válidos para presentación trimestral. 
            Para TicketBAI (País Vasco), consulta la documentación específica.
          </p>
        </div>
      </div>
    </div>
  );
}