import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, ShoppingCart, Package, TrendingUp, Check, ArrowRight, Code, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";

export default function ECommerceInfo() {
  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl mb-4 shadow-xl">
            <Globe className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            🌐 ¿Qué es el eCommerce?
          </h1>
          <p className="text-xl text-slate-600">
            Tu tienda online conectada con tu sistema POS
          </p>
        </div>

        {/* Explicación Principal */}
        <Card className="shadow-xl border-0 mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">
              Definición
            </h2>
            <p className="text-lg text-slate-700 leading-relaxed mb-4">
              El <strong>eCommerce</strong> (comercio electrónico) es la venta de productos a través de internet. 
              En tu sistema POSCommerce, el módulo de eCommerce te permite:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <span className="text-slate-700">
                  <strong>Vender online</strong> mientras mantienes el control de tu inventario en tiempo real
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <span className="text-slate-700">
                  <strong>Sincronizar</strong> automáticamente el stock entre tu tienda física y online
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <span className="text-slate-700">
                  <strong>Gestionar todo desde un solo lugar</strong>: productos, ventas, clientes e inventario
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Diferencias POS vs eCommerce */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-lg border-2 border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <ShoppingCart className="w-6 h-6" />
                POS - Tienda Física
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Ventas presenciales en tu local</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Cobro inmediato (efectivo, tarjeta, Bizum)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Entrega instantánea del producto</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Genera ticket de compra y factura</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Control de varias tiendas/sucursales</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <Globe className="w-6 h-6" />
                eCommerce - Tienda Online
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>Ventas por internet 24/7</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>Pago online (tarjeta, PayPal, Bizum)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>Envío a domicilio o recogida en tienda</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>Catálogo online con fotos y descripciones</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>Integración con WooCommerce/PrestaShop</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Guía de Integración Práctica */}
        <Card className="shadow-xl border-0 mb-8 border-l-4 border-l-purple-600">
          <CardContent className="p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Code className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  🔌 Guía de Integración Técnica
                </h2>
                <p className="text-slate-600">
                  Conecta tu tienda online con POSCommerce en 3 pasos
                </p>
              </div>
            </div>

            {/* Paso 1 */}
            <div className="mb-8 bg-blue-50 p-6 rounded-lg">
              <h3 className="font-bold text-xl mb-4 text-blue-900 flex items-center gap-2">
                <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                Opción A: Plugin para WooCommerce/PrestaShop
              </h3>
              <p className="text-slate-700 mb-4">
                Desarrolla un plugin simple que sincronice los productos automáticamente:
              </p>
              <div className="bg-white rounded-lg p-4 font-mono text-sm overflow-x-auto border">
                <pre className="text-slate-800">{`// En tu plugin de WooCommerce
function sync_products_from_poscommerce() {
  $api_url = 'https://tuapp.base44.com/api/products';
  $response = wp_remote_get($api_url);
  $products = json_decode($response['body']);
  
  foreach ($products as $product) {
    if ($product->show_in_ecommerce) {
      // Crear o actualizar producto en WooCommerce
      wc_create_or_update_product($product);
    }
  }
}

// Ejecutar cada hora
add_action('hourly_sync', 'sync_products_from_poscommerce');`}</pre>
              </div>
              <p className="text-xs text-slate-600 mt-3">
                💡 <strong>Tip:</strong> Usa WordPress Cron Jobs para sincronizar automáticamente cada hora
              </p>
            </div>

            {/* Paso 2 */}
            <div className="mb-8 bg-green-50 p-6 rounded-lg">
              <h3 className="font-bold text-xl mb-4 text-green-900 flex items-center gap-2">
                <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                Opción B: Tienda Online desde Cero
              </h3>
              <p className="text-slate-700 mb-4">
                Crea tu propia web con React/Vue que muestre productos desde POSCommerce:
              </p>
              <div className="bg-white rounded-lg p-4 font-mono text-sm overflow-x-auto border mb-4">
                <pre className="text-slate-800">{`// Ejemplo con React
import { useState, useEffect } from 'react';

function ProductCatalog() {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    fetch('https://tuapp.base44.com/api/products?show_in_ecommerce=true')
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);
  
  return (
    <div className="product-grid">
      {products.map(product => (
        <ProductCard 
          key={product.id}
          product={product}
          onAddToCart={handleAddToCart}
        />
      ))}
    </div>
  );
}`}</pre>
              </div>
              <div className="bg-white rounded-lg p-4 font-mono text-sm overflow-x-auto border">
                <pre className="text-slate-800">{`// Procesar venta cuando el cliente compra
function handleCheckout(cart, customer) {
  fetch('https://tuapp.base44.com/api/sales', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      channel: 'ecommerce',
      customer_name: customer.name,
      customer_email: customer.email,
      items: cart.items,
      total: cart.total,
      payment_method: 'tarjeta'
    })
  });
}`}</pre>
              </div>
            </div>

            {/* Paso 3 */}
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="font-bold text-xl mb-4 text-orange-900 flex items-center gap-2">
                <span className="bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                Opción C: Integración con Marketplaces
              </h3>
              <p className="text-slate-700 mb-4">
                Conecta con Amazon, eBay o redes sociales usando la API:
              </p>
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold mb-2">Instagram/Facebook Shopping</h4>
                  <p className="text-sm text-slate-700">
                    1. Exporta tu catálogo de POSCommerce a un feed XML/JSON<br/>
                    2. Conecta el feed con Facebook Catalog Manager<br/>
                    3. Las ventas se sincronizan automáticamente vía webhooks
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold mb-2">Amazon Marketplace</h4>
                  <p className="text-sm text-slate-700">
                    Usa Amazon MWS API para subir productos y recibir pedidos.<br/>
                    POSCommerce actualiza el stock automáticamente en Amazon cuando vendes en tienda física.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Soporte Técnico */}
        <Card className="shadow-xl border-0 mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Zap className="w-12 h-12 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold mb-2">¿Necesitas ayuda con la integración?</h3>
                <p className="mb-4 opacity-90">
                  Nuestro equipo de soporte puede ayudarte a configurar la integración con tu plataforma de eCommerce.
                </p>
                <div className="flex gap-3">
                  <Button variant="secondary" size="sm">
                    📧 Contactar Soporte
                  </Button>
                  <Button variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/30">
                    📚 Ver Documentación API
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ventajas */}
        <Card className="shadow-xl border-0 mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-7 h-7 text-green-600" />
              Ventajas de usar POS + eCommerce integrados
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold mb-1">Un solo inventario</h4>
                  <p className="text-sm text-slate-700">Sin errores de stock entre tienda física y online</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold mb-1">Ahorro de tiempo</h4>
                  <p className="text-sm text-slate-700">No necesitas actualizar dos sistemas diferentes</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold mb-1">Vende más</h4>
                  <p className="text-sm text-slate-700">Llega a clientes que no pueden ir a tu tienda</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold mb-1">Cumplimiento fiscal</h4>
                  <p className="text-sm text-slate-700">Facturas automáticas según normativa española</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={createPageUrl("Products")}>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
              <Package className="w-5 h-5 mr-2" />
              Configurar Productos para eCommerce
            </Button>
          </Link>
          <Link to={createPageUrl("eCommerce")}>
            <Button variant="outline" className="shadow-lg">
              Ver Catálogo Online
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}