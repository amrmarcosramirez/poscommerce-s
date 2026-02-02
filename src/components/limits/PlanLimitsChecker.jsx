import { toast } from "sonner";

// Hook para verificar límites del plan antes de crear recursos
export const usePlanLimits = (config) => {
  const checkLimit = (resourceType, currentCount) => {
    if (!config?.plan_limits) return true;

    const limits = config.plan_limits;
    let maxLimit = 0;
    let resourceName = "";

    switch (resourceType) {
      case 'stores':
        maxLimit = limits.max_stores;
        resourceName = "tiendas";
        break;
      case 'products':
        maxLimit = limits.max_products;
        resourceName = "productos";
        break;
      case 'users':
        maxLimit = limits.max_users;
        resourceName = "usuarios";
        break;
      default:
        return true;
    }

    // -1 significa ilimitado
    if (maxLimit === -1) return true;

    if (currentCount >= maxLimit) {
      toast.error(
        `Has alcanzado el límite de ${resourceName} (${maxLimit}) de tu plan. Actualiza a un plan superior.`,
        { duration: 5000 }
      );
      return false;
    }

    // Advertencia al 80%
    if (currentCount >= maxLimit * 0.8) {
      toast.warning(
        `Estás cerca del límite de ${resourceName}. ${currentCount}/${maxLimit} utilizados.`,
        { duration: 4000 }
      );
    }

    return true;
  };

  const hasFeature = (featureName) => {
    if (!config?.plan_limits?.features) return false;
    return config.plan_limits.features.includes(featureName);
  };

  return { checkLimit, hasFeature };
};