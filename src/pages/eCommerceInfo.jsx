import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, ShoppingCart, Package, TrendingUp, Check, ArrowRight, Store, Link as LinkIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";

export default function ECommerceInfo() {
  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
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
                  <span>Carrito de compras online</span>
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
                  <span>Stock sincronizado en tiempo real</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* NUEVA SECCIÓN: Cómo usar eCommerce como Tienda Online Propia */}
        <Card className="shadow-xl border-0 mb-8 bg-gradient-to-br from-purple-50 to-blue-50">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-slate-900 flex items-center gap-2">
              <Store className="w-7 h-7 text-purple-600" />
              ¿Cómo usar el eCommerce como Tienda Online Propia?
            </h2>
            
            <div className="bg-white rounded-lg p-6 mb-6 border-2 border-purple-200">
              <h3 className="font-bold text-lg mb-3 text-purple-900">🎯 Opción 1: Usar POSCommerce Directamente</h3>
              <p className="text-slate-700 mb-4">
                Tu módulo eCommerce <strong>YA FUNCIONA como una tienda online completa</strong>. Los clientes pueden:
              </p>
              <ol className="space-y-3 ml-6">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <span>Ver todos tus productos con fotos, precios y disponibilidad</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <span>Añadir productos al carrito de compras</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <span>Rellenar sus datos de envío (nombre, email, teléfono, dirección)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  <span>Confirmar el pedido - se crea automáticamente la venta y factura</span>
                </li>
              </ol>
              
              <div className="mt-6 bg-purple-50 rounded-lg p-4 border border-purple-200">
                <p className="text-sm text-purple-900 mb-2">
                  <strong>💡 ¿Cómo compartir tu tienda?</strong>
                </p>
                <p className="text-sm text-purple-800 mb-3">
                  Comparte el enlace de la página eCommerce con tus clientes:
                </p>
                <div className="flex items-center gap-2 bg-white p-3 rounded border border-purple-300">
                  <LinkIcon className="w-4 h-4 text-purple-600" />
                  <code className="text-sm text-purple-700 flex-1">
                    tuapp.base44.com/eCommerce
                  </code>
                </div>
                <p className="text-xs text-purple-700 mt-2">
                  Puedes enviar este enlace por WhatsApp, Instagram, Facebook, email, etc.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border-2 border-blue-200">
              <h3 className="font-bold text-lg mb-3 text-blue-900">🔗 Opción 2: Integrar con tu Web Existente</h3>
              <p className="text-slate-700 mb-4">
                Si ya tienes una página web (WordPress, HTML, etc.), puedes añadir un botón que lleve a tu eCommerce:
              </p>
              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <code className="text-sm text-slate-800 block">
                  {'<a href="tuapp.base44.com/eCommerce">'}<br/>
                  {'  <button>🛒 Ver Tienda Online</button>'}<br/>
                  {'</a>'}
                </code>
              </div>
              <p className="text-sm text-slate-600">
                O crear un iframe para mostrar la tienda directamente en tu web.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Flujo de Compra */}
        <Card className="shadow-xl border-0 mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">
              🛒 Flujo de Compra del Cliente
            </h2>
            
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">Cliente visita tu eCommerce</h3>
                  <p className="text-slate-700">
                    Entra al enlace que compartiste y ve tu catálogo completo de productos con fotos, precios y stock disponible.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">Añade productos al carrito</h3>
                  <p className="text-slate-700">
                    Hace clic en "Añadir al Carrito" en cada producto que desea comprar. Puede elegir variantes (colores, tallas) si están disponibles.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">Revisa su pedido</h3>
                  <p className="text-slate-700">
                    Hace clic en el botón "Carrito" para ver el resumen de su compra, ajustar cantidades o eliminar productos.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">Completa sus datos</h3>
                  <p className="text-slate-700">
                    Rellena el formulario con nombre, email, teléfono y dirección de envío.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  5
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">Confirma el pedido</h3>
                  <p className="text-slate-700 mb-3">
                    Al confirmar, el sistema automáticamente:
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span>Crea la venta con estado "pendiente"</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span>Actualiza el stock de productos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span>Genera la factura automáticamente</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span>Registra el pedido en tu sistema</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  6
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">Tú gestionas el envío</h3>
                  <p className="text-slate-700">
                    Ves el pedido en la sección "Ventas" con todos los detalles del cliente. 
                    Preparas el pedido y lo envías. Puedes contactar al cliente por teléfono o email.
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
              Ventajas de usar POSCommerce como Tienda Online
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold mb-1">Listo para usar</h4>
                  <p className="text-sm text-slate-700">No necesitas crear una web desde cero, ya está funcionando</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold mb-1">Stock en tiempo real</h4>
                  <p className="text-sm text-slate-700">Los clientes ven exactamente qué productos están disponibles</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold mb-1">Gestión centralizada</h4>
                  <p className="text-sm text-slate-700">Todos los pedidos (físicos y online) en un solo lugar</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold mb-1">Facturas automáticas</h4>
                  <p className="text-sm text-slate-700">Cada venta online genera su factura cumpliendo normativa</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold mb-1">Sin costes extra</h4>
                  <p className="text-sm text-slate-700">No necesitas pagar por plataformas adicionales</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold mb-1">Fácil de compartir</h4>
                  <p className="text-sm text-slate-700">Un simple enlace para empezar a vender online</p>
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
            <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg">
              <Globe className="w-5 h-5 mr-2" />
              Ver Mi Tienda Online
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}