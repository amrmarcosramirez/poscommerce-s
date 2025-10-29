
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TrendingUp, Search, Eye, Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function Sales() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);
  const [storeFilter, setStoreFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: () => base44.entities.Sale.list('-sale_date'),
  });

  const { data: stores = [] } = useQuery({
    queryKey: ['stores'],
    queryFn: () => base44.entities.Store.list(),
  });

  const filteredSales = sales.filter(s => {
    const matchesSearch = 
      s.sale_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStore = storeFilter === "all" || s.store_id === storeFilter;
    const matchesChannel = channelFilter === "all" || s.channel === channelFilter;
    
    return matchesSearch && matchesStore && matchesChannel;
  });

  const channelColors = {
    tienda_fisica: "bg-blue-100 text-blue-800",
    ecommerce: "bg-purple-100 text-purple-800"
  };

  const statusColors = {
    completada: "bg-green-100 text-green-800",
    pendiente: "bg-yellow-100 text-yellow-800",
    cancelada: "bg-red-100 text-red-800",
    devuelta: "bg-slate-100 text-slate-800"
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-8 h-8" />
            Historial de Ventas
          </h1>
          <p className="text-slate-600 mt-1">Consulta todas tus transacciones</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <div className="mb-4 flex gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Buscar por número de venta o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={storeFilter} onValueChange={setStoreFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🏪 Todas las tiendas</SelectItem>
                  {stores.map(store => (
                    <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los canales</SelectItem>
                  <SelectItem value="tienda_fisica">🏪 Tienda Física</SelectItem>
                  <SelectItem value="ecommerce">🌐 eCommerce</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Tienda</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead>Pago</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => {
                    const store = stores.find(s => s.id === sale.store_id);
                    return (
                      <TableRow key={sale.id} className="hover:bg-slate-50">
                        <TableCell className="font-mono text-sm">{sale.sale_number}</TableCell>
                        <TableCell>{store?.name || "-"}</TableCell>
                        <TableCell className="font-medium">{sale.customer_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {format(new Date(sale.sale_date), "dd/MM/yyyy HH:mm", { locale: es })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={channelColors[sale.channel]}>
                            {sale.channel === 'tienda_fisica' ? '🏪 Física' : '🌐 Online'}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">{sale.payment_method}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[sale.status]}>
                            {sale.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-700">
                          {sale.total?.toFixed(2)}€
                        </TableCell>
                        <TableCell>
                          <Dialog open={dialogOpen && selectedSale?.id === sale.id} onOpenChange={(open) => setDialogOpen(open)}>
                            <DialogTrigger>
                              <button
                                onClick={() => {
                                  setSelectedSale(sale);
                                  setDialogOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl" onPointerDownOutside={(e) => e.preventDefault()}>
                              <DialogHeader>
                                <DialogTitle>Detalles de Venta - {selectedSale?.sale_number}</DialogTitle>
                              </DialogHeader>
                              {selectedSale && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                                    <div>
                                      <p className="text-sm text-slate-600">Tienda</p>
                                      <p className="font-semibold">
                                        {stores.find(s => s.id === selectedSale.store_id)?.name || "-"}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-slate-600">Cliente</p>
                                      <p className="font-semibold">{selectedSale.customer_name}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-slate-600">Fecha</p>
                                      <p className="font-semibold">
                                        {format(new Date(selectedSale.sale_date), "dd/MM/yyyy HH:mm")}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-slate-600">Método de Pago</p>
                                      <p className="font-semibold capitalize">{selectedSale.payment_method}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-slate-600">Canal</p>
                                      <p className="font-semibold">
                                        {selectedSale.channel === 'tienda_fisica' ? '🏪 Tienda Física' : '🌐 eCommerce'}
                                      </p>
                                    </div>
                                  </div>

                                  <div>
                                    <h3 className="font-semibold mb-2">Productos</h3>
                                    <div className="border rounded-lg overflow-hidden">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Producto</TableHead>
                                            <TableHead>Cantidad</TableHead>
                                            <TableHead>Precio</TableHead>
                                            <TableHead className="text-right">Subtotal</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {selectedSale.items?.map((item, idx) => (
                                            <TableRow key={idx}>
                                              <TableCell>{item.product_name}</TableCell>
                                              <TableCell>{item.quantity}</TableCell>
                                              <TableCell>{item.price?.toFixed(2)}€</TableCell>
                                              <TableCell className="text-right">{item.subtotal?.toFixed(2)}€</TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>

                                  <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between">
                                      <span>Subtotal:</span>
                                      <span className="font-semibold">{selectedSale.subtotal?.toFixed(2)}€</span>
                                    </div>
                                    {selectedSale.discount > 0 && (
                                      <div className="flex justify-between text-red-600">
                                        <span>Descuento ({selectedSale.discount}%):</span>
                                        <span className="font-semibold">
                                          -{((selectedSale.subtotal * selectedSale.discount) / 100).toFixed(2)}€
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex justify-between">
                                      <span>IVA:</span>
                                      <span className="font-semibold">{selectedSale.total_iva?.toFixed(2)}€</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                      <span>Total:</span>
                                      <span className="text-green-600">{selectedSale.total?.toFixed(2)}€</span>
                                    </div>
                                  </div>

                                  {selectedSale.notes && (
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                      <p className="text-sm text-slate-600 mb-1">Notas:</p>
                                      <p>{selectedSale.notes}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
