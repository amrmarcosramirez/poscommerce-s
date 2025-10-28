
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, User, Check, Store as StoreIcon, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import TicketModal from "../components/pos/TicketModal"; // Added import

export default function POS() {
  const queryClient = useQueryClient();
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [discount, setDiscount] = useState(0);
  const [selectedStore, setSelectedStore] = useState(null);
  const [completedSale, setCompletedSale] = useState(null); // Added state
  const [showTicket, setShowTicket] = useState(false); // Added state

  const { data: stores = [] } = useQuery({
    queryKey: ['stores'],
    queryFn: () => base44.entities.Store.list(),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products', selectedStore],
    queryFn: () => base44.entities.Product.list(),
    enabled: !!selectedStore,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list(),
  });

  // Seleccionar primera tienda activa por defecto
  useEffect(() => {
    if (!selectedStore && stores.length > 0) {
      const activeStore = stores.find(s => s.is_active);
      if (activeStore) setSelectedStore(activeStore.id);
    }
  }, [stores, selectedStore]);

  const createSaleMutation = useMutation({
    mutationFn: async (saleData) => {
      // Crear venta
      const sale = await base44.entities.Sale.create(saleData);

      // Actualizar stock de productos
      for (const item of saleData.items) {
        const product = products.find(p => p.id === item.product_id);
        if (product) {
          await base44.entities.Product.update(product.id, {
            stock: product.stock - item.quantity
          });
        }
      }

      // Actualizar datos del cliente si existe
      if (selectedCustomer) {
        await base44.entities.Customer.update(selectedCustomer.id, {
          total_purchases: (selectedCustomer.total_purchases || 0) + saleData.total,
          purchase_count: (selectedCustomer.purchase_count || 0) + 1
        });
      }

      // Generar factura automáticamente
      const store = stores.find(s => s.id === selectedStore);
      const invoiceNumber = `F-${Date.now()}`;
      await base44.entities.Invoice.create({
        invoice_number: invoiceNumber,
        sale_id: sale.id,
        customer_id: selectedCustomer?.id || null,
        customer_name: selectedCustomer?.name || "Cliente general",
        customer_dni_cif: selectedCustomer?.dni_cif || "",
        customer_address: selectedCustomer?.address || "",
        invoice_date: format(new Date(), "yyyy-MM-dd"),
        store_id: selectedStore,
        items: saleData.items.map(item => ({
          description: item.product_name,
          quantity: item.quantity,
          price: item.price,
          iva_rate: item.iva_rate,
          subtotal: item.subtotal
        })),
        base_imponible: saleData.subtotal,
        total_iva: saleData.total_iva,
        total: saleData.total,
        payment_method: saleData.payment_method,
        status: "emitida"
      });

      return sale;
    },
    onSuccess: (sale) => { // Modified onSuccess to receive sale
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });

      // Mostrar ticket
      setCompletedSale(sale);
      setShowTicket(true);

      // Limpiar formulario
      setCart([]);
      setSelectedCustomer(null);
      setDiscount(0);

      toast.success("✅ Venta completada y factura generada");
    },
  });

  // Filtrar productos por tienda seleccionada
  const storeProducts = products.filter(p =>
    (!p.store_id || p.store_id === selectedStore) &&
    p.is_active &&
    p.stock > 0
  );

  const filteredProducts = storeProducts.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product_id === product.id);

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error("No hay suficiente stock disponible");
        return;
      }
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([...cart, {
        product_id: product.id,
        product_name: product.name,
        sku: product.sku,
        quantity: 1,
        price: product.price,
        iva_rate: product.iva_rate,
        discount: 0,
        subtotal: product.price
      }]);
    }
  };

  const updateQuantity = (productId, delta) => {
    const product = products.find(p => p.id === productId);
    setCart(cart.map(item => {
      if (item.product_id === productId) {
        const newQuantity = Math.max(0, Math.min(product.stock, item.quantity + delta));
        return {
          ...item,
          quantity: newQuantity,
          subtotal: newQuantity * item.price
        };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const discountAmount = (subtotal * discount) / 100;
    const subtotalAfterDiscount = subtotal - discountAmount;
    const ivaAmount = cart.reduce((sum, item) => {
      const itemAfterDiscount = (item.subtotal / subtotal) * subtotalAfterDiscount;
      return sum + (itemAfterDiscount * item.iva_rate / 100);
    }, 0);
    const total = subtotalAfterDiscount + ivaAmount;

    return { subtotal, discountAmount, subtotalAfterDiscount, ivaAmount, total };
  };

  const completeSale = async () => {
    if (!selectedStore) {
      toast.error("Selecciona una tienda primero");
      return;
    }

    if (cart.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }

    const totals = calculateTotals();
    const saleNumber = `V-${Date.now()}`;

    const saleData = {
      sale_number: saleNumber,
      store_id: selectedStore,
      customer_id: selectedCustomer?.id || null,
      customer_name: selectedCustomer?.name || "Cliente general",
      sale_date: new Date().toISOString(),
      items: cart,
      subtotal: totals.subtotalAfterDiscount,
      total_iva: totals.ivaAmount,
      discount: discount,
      total: totals.total,
      payment_method: paymentMethod,
      status: "completada",
      channel: "tienda_fisica"
    };

    createSaleMutation.mutate(saleData);
  };

  const totals = calculateTotals();
  const selectedStoreData = stores.find(s => s.id === selectedStore);

  if (!selectedStore) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-screen">
        <Card className="max-w-md shadow-xl">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-orange-500" />
            <h2 className="text-2xl font-bold mb-2">No hay tiendas disponibles</h2>
            <p className="text-slate-600 mb-4">Necesitas crear al menos una tienda para usar el POS</p>
            <Button onClick={() => window.location.href = '/stores'} className="bg-blue-600">
              Ir a Gestión de Tiendas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">🏪 Punto de Venta (POS)</h1>
              <p className="text-slate-600">Ventas en tienda física</p>
            </div>

            {/* Selector de Tienda */}
            <Card className="min-w-[250px]">
              <CardContent className="p-4">
                <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <StoreIcon className="w-4 h-4" />
                  Tienda Actual
                </label>
                <Select value={selectedStore} onValueChange={setSelectedStore}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.filter(s => s.is_active).map(store => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name} - {store.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedStoreData && (
                  <p className="text-xs text-slate-500 mt-2">
                    📍 {selectedStoreData.address}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Productos */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="shadow-lg border-0">
                <CardHeader className="border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      placeholder="Buscar producto por nombre, SKU o código de barras..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => addToCart(product)}
                        className="p-4 border rounded-xl hover:shadow-md hover:border-blue-400 transition-all text-left bg-white"
                      >
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-32 object-cover rounded-lg mb-2"
                          />
                        )}
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-slate-900 line-clamp-2">{product.name}</h3>
                          {product.stock <= product.min_stock && (
                            <Badge variant="destructive" className="text-xs">Bajo</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mb-2">Stock: {product.stock}</p>
                        <p className="text-xl font-bold text-blue-600">{product.price.toFixed(2)}€</p>
                        <p className="text-xs text-slate-500">+IVA {product.iva_rate}%</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Carrito */}
            <div className="space-y-4">
              <Card className="shadow-lg border-0">
                <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Carrito ({cart.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {/* Cliente */}
                  <div className="mb-4">
                    <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Cliente
                    </label>
                    <Select
                      value={selectedCustomer?.id || "general"}
                      onValueChange={(value) => {
                        if (value === "general") {
                          setSelectedCustomer(null);
                        } else {
                          setSelectedCustomer(customers.find(c => c.id === value));
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Cliente general" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Cliente general</SelectItem>
                        {customers.map(customer => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Items del carrito */}
                  <div className="space-y-2 max-h-[300px] overflow-y-auto mb-4">
                    {cart.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p>Carrito vacío</p>
                      </div>
                    ) : (
                      cart.map((item) => (
                        <div key={item.product_id} className="p-3 bg-slate-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-sm">{item.product_name}</h4>
                            <button
                              onClick={() => removeFromCart(item.product_id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.product_id, -1)}
                                className="w-6 h-6 rounded bg-white border flex items-center justify-center"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-semibold">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.product_id, 1)}
                                className="w-6 h-6 rounded bg-white border flex items-center justify-center"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="font-bold text-blue-600">{item.subtotal.toFixed(2)}€</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Descuento */}
                  <div className="mb-4">
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Descuento (%)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={discount}
                      onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                    />
                  </div>

                  {/* Método de pago */}
                  <div className="mb-4">
                    <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Método de pago
                    </label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="efectivo">💵 Efectivo</SelectItem>
                        <SelectItem value="tarjeta">💳 Tarjeta</SelectItem>
                        <SelectItem value="bizum">📱 Bizum</SelectItem>
                        <SelectItem value="transferencia">🏦 Transferencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Totales */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Subtotal:</span>
                      <span className="font-medium">{totals.subtotal.toFixed(2)}€</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Descuento ({discount}%):</span>
                        <span className="font-medium text-red-600">-{totals.discountAmount.toFixed(2)}€</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">IVA:</span>
                      <span className="font-medium">{totals.ivaAmount.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total:</span>
                      <span className="text-green-600">{totals.total.toFixed(2)}€</span>
                    </div>
                  </div>

                  <Button
                    onClick={completeSale}
                    disabled={cart.length === 0 || createSaleMutation.isPending}
                    className="w-full mt-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-6 shadow-lg"
                  >
                    {createSaleMutation.isPending ? (
                      "Procesando..."
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Completar Venta y Generar Factura
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Ticket */}
      {showTicket && completedSale && selectedStoreData && ( // Added conditions for completedSale and selectedStoreData
        <TicketModal
          sale={completedSale}
          store={selectedStoreData}
          onClose={() => {
            setShowTicket(false);
            setCompletedSale(null);
          }}
        />
      )}
    </>
  );
}
