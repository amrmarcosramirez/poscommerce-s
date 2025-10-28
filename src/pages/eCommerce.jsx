import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Search, ShoppingBag, Package } from "lucide-react";

export default function ECommerce() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: () => base44.entities.Sale.filter({ channel: 'ecommerce' }, '-sale_date', 50),
  });

  // Solo productos activos y marcados para eCommerce
  const ecommerceProducts = products.filter(p => 
    p.is_active && 
    p.show_in_ecommerce && 
    p.stock > 0
  );

  const filteredProducts = ecommerceProducts.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(ecommerceProducts.map(p => p.category))];
  
  const totalOnlineSales = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-8 h-8 text-purple-600" />
            🌐 eCommerce / Tienda Online
          </h1>
          <p className="text-slate-600 mt-1">Gestiona tus ventas online</p>
        </div>

        {/* Estadísticas */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Productos en Línea</p>
                  <p className="text-3xl font-bold text-purple-600">{ecommerceProducts.length}</p>
                </div>
                <Package className="w-12 h-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Ventas Online</p>
                  <p className="text-3xl font-bold text-green-600">{sales.length}</p>
                </div>
                <ShoppingBag className="w-12 h-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Ventas Online</p>
                  <p className="text-3xl font-bold text-blue-600">{totalOnlineSales.toFixed(2)}€</p>
                </div>
                <Globe className="w-12 h-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Catálogo Online */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Catálogo Online</h2>
            
            <div className="mb-4 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  No hay productos en línea
                </h3>
                <p className="text-slate-500">
                  Marca productos como "Mostrar en eCommerce" para que aparezcan aquí
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        <Package className="w-16 h-16 text-slate-400" />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <Badge variant="outline" className="mb-2">{product.category}</Badge>
                      <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-2xl font-bold text-purple-600">
                            {(product.price * (1 + product.iva_rate / 100)).toFixed(2)}€
                          </p>
                          <p className="text-xs text-slate-500">IVA incluido</p>
                        </div>
                        <Badge variant={product.stock > product.min_stock ? "default" : "destructive"}>
                          Stock: {product.stock}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información */}
        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-purple-900 mb-2">🌐 Integración eCommerce</h3>
          <p className="text-sm text-purple-800">
            Esta vista muestra los productos disponibles para tu tienda online. 
            Puedes integrar con WooCommerce, PrestaShop o usar tu propia tienda online.
            Los productos marcados como "Mostrar en eCommerce" aparecerán automáticamente.
          </p>
        </div>
      </div>
    </div>
  );
}