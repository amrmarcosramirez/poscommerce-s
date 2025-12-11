import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle } from "lucide-react";
import { differenceInDays } from "date-fns";
import { createPageUrl } from "@/utils";

export default function TrialBanner({ config }) {
  if (!config || config.subscription_status !== "trial" || !config.trial_ends_at) {
    return null;
  }

  const daysLeft = differenceInDays(new Date(config.trial_ends_at), new Date());
  
  if (daysLeft < 0) return null;

  const isUrgent = daysLeft <= 3;

  return (
    <Alert className={`mb-4 ${isUrgent ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isUrgent ? (
            <AlertTriangle className="w-5 h-5 text-red-600" />
          ) : (
            <Clock className="w-5 h-5 text-blue-600" />
          )}
          <AlertDescription className={isUrgent ? 'text-red-900' : 'text-blue-900'}>
            <span className="font-semibold">
              {daysLeft === 0 ? '¡Último día de prueba!' : `Te quedan ${daysLeft} días de prueba gratuita`}
            </span>
            {' '}
            Activa tu suscripción para continuar usando POSCommerce sin interrupciones.
          </AlertDescription>
        </div>
        <Button 
          size="sm"
          className={isUrgent ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
          onClick={() => window.location.href = createPageUrl("Billing")}
        >
          Activar Suscripción
        </Button>
      </div>
    </Alert>
  );
}