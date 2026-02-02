import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function TrialExpired() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full shadow-2xl border-0">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Tu periodo de prueba ha finalizado
          </h1>
          
          <p className="text-lg text-slate-600 mb-8">
            Para continuar usando POSCommerce y acceder a todas tus tiendas, productos y ventas, 
            necesitas activar una suscripción.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-3">¿Qué incluye tu suscripción?</h3>
            <ul className="text-left text-blue-800 space-y-2">
              <li>✅ Acceso completo a todas tus tiendas y productos</li>
              <li>✅ POS + eCommerce sin límites de uso</li>
              <li>✅ Todos tus datos guardados y seguros</li>
              <li>✅ Soporte técnico prioritario</li>
              <li>✅ Actualizaciones y nuevas funcionalidades</li>
            </ul>
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-lg px-8"
              onClick={() => window.location.href = createPageUrl("Billing")}
            >
              Activar Suscripción Ahora
            </Button>
          </div>

          <p className="text-sm text-slate-500 mt-6">
            ¿Necesitas ayuda? Contacta con soporte
          </p>
        </CardContent>
      </Card>
    </div>
  );
}