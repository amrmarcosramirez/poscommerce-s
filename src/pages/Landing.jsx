import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Store, ShoppingCart, BarChart3, Globe, Package, Users, Zap, Shield, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

const plans = [
  {
    name: "Básico",
    price: "29€",
    period: "/mes",
    description: "Perfecto para empezar",
    features: [
      "1 tienda física",
      "Hasta 100 productos",
      "2 usuarios",
      "POS básico",
      "Gestión de inventario",
      "Informes básicos",
      "Soporte por email"
    ],
    gradient: "from-blue-500 to-blue-600",
    popular: false
  },
  {
    name: "Estándar",
    price: "79€",
    period: "/mes",
    description: "Para negocios en crecimiento",
    features: [
      "Hasta 5 tiendas",
      "Hasta 1000 productos",
      "5 usuarios",
      "POS avanzado + eCommerce",
      "Gestión multi-tienda",
      "Informes avanzados",
      "Programa de fidelización",
      "Soporte prioritario"
    ],
    gradient: "from-purple-500 to-purple-600",
    popular: true
  },
  {
    name: "Premium",
    price: "149€",
    period: "/mes",
    description: "Para empresas establecidas",
    features: [
      "Tiendas ilimitadas",
      "Productos ilimitados",
      "Usuarios ilimitados",
      "Todo lo de Estándar",
      "API personalizada",
      "Integraciones avanzadas",
      "Soporte 24/7",
      "Gestor de cuenta dedicado"
    ],
    gradient: "from-orange-500 to-orange-600",
    popular: false
  }
];

const features = [
  {
    icon: Store,
    title: "Punto de Venta (POS)",
    description: "Sistema POS completo para tus tiendas físicas con gestión de stock en tiempo real"
  },
  {
    icon: Globe,
    title: "Tienda Online (eCommerce)",
    description: "Vende online con sincronización automática de inventario entre todos tus canales"
  },
  {
    icon: Package,
    title: "Gestión de Inventario",
    description: "Control total del stock por tienda, grupos o unificado. Con alertas de stock bajo"
  },
  {
    icon: BarChart3,
    title: "Informes y Analíticas",
    description: "Reportes detallados de ventas, productos más vendidos, y análisis de rendimiento"
  },
  {
    icon: Users,
    title: "Gestión de Clientes",
    description: "Base de datos de clientes con programa de fidelización y seguimiento de compras"
  },
  {
    icon: Zap,
    title: "Facturación Automática",
    description: "Generación automática de facturas conformes con la normativa española"
  }
];

export default function Landing() {
  const handleGetStarted = () => {
    base44.auth.isAuthenticated().then(auth => {
      if (auth) {
        // Si ya está autenticado, ir al dashboard
        window.location.href = createPageUrl("Dashboard");
      } else {
        // Si no está autenticado, redirigir a login y luego a onboarding
        base44.auth.redirectToLogin(createPageUrl("Onboarding"));
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">POSCommerce</h1>
          </div>
          <Button onClick={handleGetStarted} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
            Empezar Ahora
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">
            ✨ Sistema todo-en-uno para tu negocio
          </Badge>
          <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
            Tu Negocio, Físico y Online,
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              En Una Sola Plataforma
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Gestiona tu punto de venta, eCommerce, inventario, clientes y ventas desde un único sistema. 
            Diseñado para negocios modernos que quieren crecer.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              onClick={handleGetStarted}
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-lg px-8 py-6 shadow-lg"
            >
              Prueba Gratis 14 Días
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6"
              onClick={() => document.getElementById('planes').scrollIntoView({ behavior: 'smooth' })}
            >
              Ver Planes y Precios
            </Button>
          </div>
          <p className="text-sm text-slate-500 mt-4">
            ✅ Sin tarjeta de crédito • ✅ Configuración en 5 minutos • ✅ Cancelación en cualquier momento
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Todo lo que necesitas para vender más
            </h2>
            <p className="text-xl text-slate-600">
              Herramientas potentes y fáciles de usar para gestionar tu negocio
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-100">
                ¿Por qué POSCommerce?
              </Badge>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">
                Simplifica tu operación y aumenta tus ventas
              </h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Sincronización en Tiempo Real</h4>
                    <p className="text-slate-600">Stock actualizado automáticamente entre tiendas físicas y online</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Multi-Tienda</h4>
                    <p className="text-slate-600">Gestiona múltiples ubicaciones desde un solo panel de control</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Cumplimiento Legal</h4>
                    <p className="text-slate-600">Facturación conforme a normativa española con IVA incluido</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Fácil de Usar</h4>
                    <p className="text-slate-600">Interfaz intuitiva que tu equipo puede aprender en minutos</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-slate-900 mb-1">+35%</div>
                  <p className="text-sm text-slate-600">Incremento promedio en ventas</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-slate-900 mb-1">5min</div>
                  <p className="text-sm text-slate-600">Tiempo de configuración</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-slate-900 mb-1">99.9%</div>
                  <p className="text-sm text-slate-600">Disponibilidad garantizada</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-slate-900 mb-1">24/7</div>
                  <p className="text-sm text-slate-600">Soporte disponible</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planes" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Planes para cada tipo de negocio
            </h2>
            <p className="text-xl text-slate-600">
              Empieza gratis y crece con nosotros. Sin compromisos a largo plazo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative border-0 shadow-xl hover:shadow-2xl transition-all ${
                  plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-1">
                      Más Popular
                    </Badge>
                  </div>
                )}
                <CardContent className="p-8">
                  <div className={`w-12 h-12 bg-gradient-to-br ${plan.gradient} rounded-xl flex items-center justify-center mb-4`}>
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-slate-600 mb-4">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-600">{plan.period}</span>
                  </div>
                  <Button 
                    onClick={handleGetStarted}
                    className={`w-full mb-6 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800' 
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                    }`}
                  >
                    Empezar Prueba Gratis
                  </Button>
                  <ul className="space-y-3">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-slate-600 mt-12">
            Todos los planes incluyen 14 días de prueba gratuita. Sin tarjeta de crédito requerida.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            ¿Listo para hacer crecer tu negocio?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a cientos de comercios que ya confían en POSCommerce
          </p>
          <Button 
            onClick={handleGetStarted}
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 shadow-xl"
          >
            Crear Cuenta Gratis
          </Button>
          <p className="text-sm text-blue-100 mt-4">
            Configuración gratuita • Soporte incluido • Cancela cuando quieras
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">POSCommerce</span>
          </div>
          <p className="mb-4">
            Sistema de gestión todo-en-uno para tiendas físicas y online
          </p>
          <p className="text-sm">
            © 2025 POSCommerce. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}