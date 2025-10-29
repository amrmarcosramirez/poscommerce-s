
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Globe, Search, ShoppingBag, Package, ShoppingCart, Minus, Plus, X, Check } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function ECommerce() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postal_code: "",
    notes: ""
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: () => base44.entities.Sale.filter({ channel: 'ecommerce' }, '-sale_date', 50),
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      // Crear venta online
      const sale = await base44.entities.Sale.create(orderData);
      
      // Actualizar stock
      for (const item of orderData.items) {
        const product = products.find(p => p.id === item.product_id);
        if (product) {
          if (item.variant_index !== undefined && product.has_variants) {
            const newVariants = [...product.variants];
            newVariants[item.variant_index].stock -= item.quantity;
            const totalStock = newVariants.reduce((sum, v) => sum + v.stock, 0);
            await base44.entities.Product.update(product.id, {
              variants: newVariants,
              stock: totalStock
            });
          } else {
            await base44.entities.Product.update(product.id, {
              stock: product.stock - item.quantity
            });
          }
        }
      }
      
      // Crear factura
      const invoiceNumber = `F-${Date.now()}`;
      await base44.entities.Invoice.create({
        invoice_number: invoiceNumber,
        sale_id: sale.id,
        customer_name: orderData.customer_name,
        customer_address: customerData.address,
        invoice_date: format(new Date(), "yyyy-MM-dd"),
        items: orderData.items.map(item => ({
          description: item.product_name,
          quantity: item.quantity,
          price: item.price,
          iva_rate: item.iva_rate,
          subtotal: item.subtotal
        })),
        base_imponible: orderData.subtotal,
        total_iva: orderData.total_iva,
        total: orderData.total,
        payment_method: "online",
        status: "emitida"
      });
      
      return sale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setCart([]);
      setShowCheckout(false);
      setCustomerData({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        postal_code: "",
        notes: ""
      });
      toast.success("✅ Pedido realizado con éxito. Recibirás un email de confirmación.");
    },
  });

  // Expandir productos con variantes
  const expandedProducts = products.flatMap(product => {
    if (!product.is_active || !product.show_in_ecommerce) {
      return [];
    }
    
    if (!product.has_variants || !product.variants || product.variants.length === 0) {
      return product.stock > 0 ? [product] : [];
    }
    
    return product.variants
      .filter(variant => variant.stock > 0)
      .map((variant, index) => ({
        ...product,
        id: `${product.id}_variant_${index}`,
        original_id: product.id,
        variant_index: index,
        name: `${product.name} - ${variant.attributes.color || ''} ${variant.attributes.talla || ''}`.trim(),
        price: product.price + (variant.price_adjustment || 0),
        stock: variant.stock,
        image_url: variant.image_url || product.image_url,
        is_variant: true
      }));
  });

  const filteredProducts = expandedProducts.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(expandedProducts.map(p => p.category))];
  const totalOnlineSales = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);

  const addToCart = (product) => {
    const productId = product.is_variant ? product.id : product.id;
    const existingItem = cart.find(item => item.cart_id === productId);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error("No hay suficiente stock disponible");
        return;
      }
      setCart(cart.map(item =>
        item.cart_id === productId
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([...cart, {
        cart_id: productId,
        product_id: product.is_variant ? product.original_id : product.id,
        variant_index: product.variant_index,
        product_name: product.name,
        quantity: 1,
        price: product.price,
        iva_rate: product.iva_rate,
        subtotal: product.price,
        max_stock: product.stock
      }]);
    }
    toast.success("Producto añadido al carrito");
  };

  const updateQuantity = (cartId, delta) => {
    setCart(cart.map(item => {
      if (item.cart_id === cartId) {
        const newQuantity = Math.max(0, Math.min(item.max_stock, item.quantity + delta));
        return {
          ...item,
          quantity: newQuantity,
          subtotal: newQuantity * item.price
        };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cart_id !== cartId));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const ivaAmount = cart.reduce((sum, item) => sum + (item.subtotal * item.iva_rate / 100), 0);
    const total = subtotal + ivaAmount;
    
    return { subtotal, ivaAmount, total };
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }
    setShowCheckout(true);
  };

  const completeOrder = (e) => {
    e.preventDefault();
    
    if (!customerData.name || !customerData.email || !customerData.phone) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    const totals = calculateTotals();
    const orderNumber = `V-${Date.now()}`;
    
    const orderData = {
      sale_number: orderNumber,
      customer_name: customerData.name,
      sale_date: new Date().toISOString(),
      items: cart.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        iva_rate: item.iva_rate,
        subtotal: item.subtotal,
        variant_index: item.variant_index
      })),
      subtotal: totals.subtotal,
      total_iva: totals.ivaAmount,
      discount: 0,
      total: totals.total,
      payment_method: "online",
      status: "pendiente",
      channel: "ecommerce",
      notes: customerData.notes
    };

    createOrderMutation.mutate(orderData);
  };

  const totals = calculateTotals();

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-8 h-8 text-purple-600" />
              🌐 Tienda Online
            </h1>
            <p className="text-slate-600 mt-1">Compra tus productos online</p>
          </div>

          {/* Carrito siempre visible */}
          <Button onClick={handleCheckout} className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg relative">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Carrito 
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                {cart.length}
              </span>
            )}
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Productos Disponibles</p>
                  <p className="text-3xl font-bold text-purple-600">{expandedProducts.length}</p>
                </div>
                <Package className="w-12 h-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Pedidos Online</p>
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
                  <p className="text-sm text-slate-600 mb-1">Ventas Totales</p>
                  <p className="text-3xl font-bold text-blue-600">{totalOnlineSales.toFixed(2)}€</p>
                </div>
                <Globe className="w-12 h-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Catálogo */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Catálogo de Productos</h2>
            
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
                  No hay productos disponibles
                </h3>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-shadow">
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
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <p className="text-2xl font-bold text-purple-600">
                            {(product.price * (1 + product.iva_rate / 100)).toFixed(2)}€
                          </p>
                          <p className="text-xs text-slate-500">IVA incluido</p>
                        </div>
                        <Badge variant={product.stock > (product.min_stock || 5) ? "default" : "destructive"}>
                          Stock: {product.stock}
                        </Badge>
                      </div>
                      <Button 
                        onClick={() => addToCart(product)} 
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Añadir al Carrito
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal Checkout */}
        <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>Finalizar Pedido</DialogTitle>
            </DialogHeader>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Carrito */}
              <div>
                <h3 className="font-bold text-lg mb-4">Tu Pedido</h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto mb-4">
                  {cart.map((item) => (
                    <div key={item.cart_id} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">{item.product_name}</h4>
                        <button
                          onClick={() => removeFromCart(item.cart_id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.cart_id, -1)}
                            className="w-6 h-6 rounded bg-white border flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.cart_id, 1)}
                            className="w-6 h-6 rounded bg-white border flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-bold text-purple-600">{item.subtotal.toFixed(2)}€</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold">{totals.subtotal.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA:</span>
                    <span className="font-semibold">{totals.ivaAmount.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-purple-600">{totals.total.toFixed(2)}€</span>
                  </div>
                </div>
              </div>

              {/* Formulario */}
              <form onSubmit={completeOrder} className="space-y-4">
                <h3 className="font-bold text-lg mb-4">Datos de Envío</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <Input
                    id="name"
                    value={customerData.name}
                    onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerData.email}
                    onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={customerData.address}
                    onChange={(e) => setCustomerData({...customerData, address: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      value={customerData.city}
                      onChange={(e) => setCustomerData({...customerData, city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">C.P.</Label>
                    <Input
                      id="postal_code"
                      value={customerData.postal_code}
                      onChange={(e) => setCustomerData({...customerData, postal_code: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas del pedido</Label>
                  <Input
                    id="notes"
                    value={customerData.notes}
                    onChange={(e) => setCustomerData({...customerData, notes: e.target.value})}
                    placeholder="Instrucciones especiales..."
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 py-6"
                  disabled={createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending ? (
                    "Procesando..."
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Confirmar Pedido - {totals.total.toFixed(2)}€
                    </>
                  )}
                </Button>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
