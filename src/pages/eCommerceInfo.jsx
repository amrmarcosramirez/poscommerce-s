import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, ShoppingCart, Package, TrendingUp, Check, ArrowRight } from "lucide-react";
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

        {/* Cómo funciona */}
        <Card className="shadow-xl border-0 mb-8 bg-gradient-to-br from-slate-50 to-blue-50">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-slate-900 flex items-center gap-2">
              <Package className="w-7 h-7 text-blue-600" />
              ¿Cómo usar el eCommerce en tu aplicación?
            </h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Marca tus productos para venta online</h3>
                  <p className="text-slate-700">
                    En la sección de <strong>Productos</strong>, activa la opción "🌐 Mostrar en eCommerce" 
                    para cada producto que quieras vender online. Asegúrate de añadir fotos y descripciones atractivas.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Sincronización automática de stock</h3>
                  <p className="text-slate-700">
                    Cuando vendas un producto en el POS (tienda física), el stock se actualiza automáticamente 
                    en el eCommerce. Lo mismo ocurre con las ventas online: el stock se sincroniza en tiempo real.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Integración con plataformas</h3>
                  <p className="text-slate-700">
                    Puedes integrar tu catálogo con plataformas como <strong>WooCommerce</strong>, 
                    <strong>PrestaShop</strong> o crear tu propia tienda online. 
                    Todas las ventas online se registran automáticamente con canal "🌐 Online".
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Gestión unificada</h3>
                  <p className="text-slate-700">
                    Desde el Dashboard puedes ver todas tus ventas (físicas y online), gestionar productos, 
                    clientes y generar facturas que cumplen con la normativa española (AEAT, IVA, TicketBAI).
                  </p>
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