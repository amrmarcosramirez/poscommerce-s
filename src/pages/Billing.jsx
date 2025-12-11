import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Calendar, Check, AlertCircle } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

const plans = {
  basico: {
    name: "Básico",
    price: 29,
    features: ["1 tienda", "100 productos", "2 usuarios", "POS básico"]
  },
  estandar: {
    name: "Estándar",
    price: 79,
    features: ["5 tiendas", "1000 productos", "5 usuarios", "POS + eCommerce"]
  },
  premium: {
    name: "Premium",
    price: 149,
    features: ["Tiendas ilimitadas", "Productos ilimitados", "Usuarios ilimitados", "Todo incluido"]
  }
};

export default function Billing() {
  const { data: config } = useQuery({
    queryKey: ['businessConfig'],
    queryFn: async () => {
      const configs = await base44.entities.BusinessConfig.list();
      return configs[0] || null;
    },
  });

  if (!config) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const currentPlan = plans[config.plan] || plans.basico;
  const isTrial = config.subscription_status === "trial";
  const trialDaysLeft = config.trial_ends_at 
    ? differenceInDays(new Date(config.trial_ends_at), new Date())
    : 0;

  const handleSubscribe = () => {
    toast.info("Redirigiendo a Stripe para completar el pago...");
    // TODO: Integrar Stripe Checkout
  };

  const handleChangePlan = (planKey) => {
    toast.info(`Cambio a plan ${plans[planKey].name} - próximamente`);
    // TODO: Implementar cambio de plan
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-8 h-8" />
            Facturación y Suscripción
          </h1>
          <p className="text-slate-600 mt-1">Gestiona tu plan y métodos de pago</p>
        </div>

        {/* Status Card */}
        <Card className={`mb-8 ${isTrial && trialDaysLeft <= 3 ? 'border-2 border-red-300 bg-red-50' : 'shadow-lg'}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Estado de Suscripción</span>
              <Badge variant={isTrial ? "secondary" : "default"} className="text-sm">
                {isTrial ? `Prueba - ${trialDaysLeft} días restantes` : "Activa"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-600 mb-1">Plan Actual</p>
                <p className="text-2xl font-bold text-slate-900">{currentPlan.name}</p>
                <p className="text-slate-600 mt-1">{currentPlan.price}€/mes</p>
              </div>
              
              {isTrial ? (
                <div>
                  <div className="flex items-center gap-2 text-orange-700 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">Periodo de Prueba</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-1">Finaliza el:</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {config.trial_ends_at ? format(new Date(config.trial_ends_at), "dd 'de' MMMM, yyyy", { locale: es }) : 'N/A'}
                  </p>
                  <Button 
                    onClick={handleSubscribe}
                    className="mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    Activar Suscripción Ahora
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 text-green-700 mb-2">
                    <Check className="w-5 h-5" />
                    <span className="font-semibold">Suscripción Activa</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-1">Próximo cobro:</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {format(new Date(), "dd 'de' MMMM, yyyy", { locale: es })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Plans Comparison */}
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Planes Disponibles</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {Object.entries(plans).map(([key, plan]) => {
            const isCurrent = config.plan === key;
            return (
              <Card key={key} className={`shadow-lg ${isCurrent ? 'ring-2 ring-blue-600' : ''}`}>
                <CardContent className="p-6">
                  {isCurrent && (
                    <Badge className="mb-3 bg-blue-600">Plan Actual</Badge>
                  )}
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-slate-900">{plan.price}€</span>
                    <span className="text-slate-600">/mes</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                        <Check className="w-4 h-4 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {!isCurrent && (
                    <Button 
                      onClick={() => handleChangePlan(key)}
                      variant="outline"
                      className="w-full"
                    >
                      {plans[key].price > currentPlan.price ? 'Mejorar Plan' : 'Cambiar a este Plan'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Payment Info */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Método de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            {isTrial ? (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">
                  No hay método de pago configurado. Activa tu suscripción para añadir una tarjeta.
                </p>
                <Button 
                  onClick={handleSubscribe}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Configurar Pago
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">•••• •••• •••• 4242</p>
                    <p className="text-sm text-slate-600">Expira 12/25</p>
                  </div>
                </div>
                <Button variant="outline">Cambiar Método de Pago</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}