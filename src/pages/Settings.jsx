import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings as SettingsIcon,
  Building2,
  Plug,
  Upload,
  Image as ImageIcon,
  X,
  Lock,
  Unlock,
} from "lucide-react";
import { toast } from "sonner";

const DASHBOARD_PATH = "/"; // <- cambia a "/dashboard" si tu dashboard real está ahí

const PLANS = {
  basico: { name: "Plan Básico", price: "19€/mes", color: "bg-blue-100 text-blue-800" },
  profesional: { name: "Plan Profesional", price: "49€/mes", color: "bg-purple-100 text-purple-800" },
};

const INTEGRATION_TYPES = {
  redsys: {
    name: "Redsys (TPV Bancario)",
    icon: "💳",
    description: "Pasarela de pago española",
    fields: ["merchant_code", "secret_key", "terminal"],
  },
  stripe: {
    name: "Stripe",
    icon: "💳",
    description: "Pasarela de pago internacional",
    fields: ["api_key", "webhook_secret"],
  },
  twilio: {
    name: "Twilio SMS",
    icon: "📱",
    description: "Envío de SMS a clientes",
    fields: ["account_sid", "auth_token", "phone_number"],
  },
  correos: {
    name: "Correos Express",
    icon: "📦",
    description: "Integración con Correos",
    fields: ["api_key", "api_url"],
  },
  mrw: { name: "MRW", icon: "🚚", description: "Mensajería MRW", fields: ["api_key"] },
  seur: { name: "SEUR", icon: "📮", description: "Mensajería SEUR", fields: ["api_key"] },
};

const FIELD_LABELS = {
  merchant_code: "Código de Comercio (FUC)",
  secret_key: "Clave Secreta SHA-256",
  terminal: "Terminal",
  api_key: "API Key",
  account_sid: "Account SID",
  auth_token: "Auth Token",
  phone_number: "Número de Teléfono",
  api_url: "URL de API",
  webhook_secret: "Webhook Secret",
};

const DEFAULT_CONFIG = {
  business_name: "",
  cif: "",
  legal_name: "",
  address: "",
  city: "",
  postal_code: "",
  phone: "",
  email: "",
  logo_url: "",
  plan: "basico",
  plan_limits: {
    max_stores: 0,
    max_products: 0,
    max_users: 0,
    features: [],
  },
};

export default function Settings() {
  const queryClient = useQueryClient();

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState(null);
  const [showCredentials, setShowCredentials] = useState({});
  const [tempLogoUrl, setTempLogoUrl] = useState("");

  const { data: config, isLoading: loadingConfig } = useQuery({
    queryKey: ["businessConfig"],
    queryFn: async () => {
      const configs = await base44.entities.BusinessConfig.list();
      return configs[0] || null;
    },
  });

  const effectiveConfig = config ?? DEFAULT_CONFIG;
  const effectiveLogoUrl = config?.logo_url || tempLogoUrl || "";

  const { data: integrations = [] } = useQuery({
    queryKey: ["integrations"],
    queryFn: () => base44.entities.Integration.list(),
  });

  // Helper: actualiza todas las queries relacionadas con businessConfig (por si en otras pantallas usas keys distintas)
  const updateBusinessConfigEverywhere = (saved) => {
    // Exacta
    queryClient.setQueryData(["businessConfig"], saved);

    // Amplia: cualquier query que empiece por "businessConfig"
    queryClient.setQueriesData(
      {
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "businessConfig",
      },
      saved
    );
  };

  const upsertConfigMutation = useMutation({
    mutationFn: async (data) => {
      if (config?.id) {
        return base44.entities.BusinessConfig.update(config.id, data);
      }
      return base44.entities.BusinessConfig.create(data);
    },
    onSuccess: (saved) => {
      // UI inmediata
      updateBusinessConfigEverywhere(saved);

      // Refetch por consistencia (si el backend añade/normaliza campos)
      queryClient.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "businessConfig",
      });

      toast.success("Configuración guardada");
    },
  });

  const createIntegrationMutation = useMutation({
    mutationFn: (data) => base44.entities.Integration.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      setEditingIntegration(null);
      toast.success("Integración configurada");
    },
  });

  const updateIntegrationMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Integration.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      setEditingIntegration(null);
      toast.success("Integración actualizada");
    },
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      if (config?.id) {
        // Guardar ya en backend
        const saved = await base44.entities.BusinessConfig.update(config.id, { logo_url: file_url });

        // UI inmediata
        updateBusinessConfigEverywhere(saved);

        // Refetch de consistencia
        queryClient.invalidateQueries({
          predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "businessConfig",
        });

        toast.success("Logo actualizado");
      } else {
        // Aún no existe config: guardamos temporal y se aplicará al guardar
        setTempLogoUrl(file_url);
        toast.success("Logo subido. Guarda la configuración para aplicarlo.");
      }
    } catch (error) {
      toast.error("Error al subir el logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      if (config?.id) {
        const saved = await base44.entities.BusinessConfig.update(config.id, { logo_url: "" });
        updateBusinessConfigEverywhere(saved);
        queryClient.invalidateQueries({
          predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "businessConfig",
        });
      } else {
        setTempLogoUrl("");
      }
      toast.success("Logo eliminado");
    } catch (e) {
      toast.error("No se pudo eliminar el logo");
    }
  };

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    // aplica logo temporal si no había config aún
    if (!config?.id && tempLogoUrl) data.logo_url = tempLogoUrl;

    try {
      const saved = await upsertConfigMutation.mutateAsync(data);

      // refuerzo de cache antes del redirect
      updateBusinessConfigEverywhere(saved);

      // ✅ Requisito: refrescar automáticamente la app + redirigir al dashboard
      // Esto fuerza a que AuthContext/Layout/PublicSettings/etc. se recalculen sin depender de cachés.
      window.location.replace(DASHBOARD_PATH);
    } catch (error) {
      toast.error("Error guardando la configuración");
    }
  };

  const handleIntegrationSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      integration_type: editingIntegration.type,
      is_active: formData.get("is_active") === "true",
      test_mode: formData.get("test_mode") === "true",
      credentials: {},
      notes: formData.get("notes") || "",
    };

    INTEGRATION_TYPES[editingIntegration.type].fields.forEach((field) => {
      const value = formData.get(field);
      if (value) data.credentials[field] = value;
    });

    if (editingIntegration.id) {
      updateIntegrationMutation.mutate({ id: editingIntegration.id, data });
    } else {
      createIntegrationMutation.mutate(data);
    }
  };

  const openIntegrationForm = (type) => {
    const existing = integrations.find((i) => i.integration_type === type);
    setEditingIntegration({
      type,
      id: existing?.id,
      data: existing || { is_active: false, test_mode: true, credentials: {} },
    });
  };

  if (loadingConfig) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <SettingsIcon className="w-8 h-8" />
            Configuración
          </h1>
          <p className="text-slate-600 mt-1">Administra tu negocio e integraciones</p>
        </div>

        {!config && (
          <div className="mb-6">
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4 text-sm text-amber-900">
                Aún no existe configuración del negocio. Rellena los datos y pulsa <b>Guardar Cambios</b> para crearla.
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="business" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="business">
              <Building2 className="w-4 h-4 mr-2" />
              Negocio
            </TabsTrigger>
            <TabsTrigger value="integrations">
              <Plug className="w-4 h-4 mr-2" />
              Integraciones
            </TabsTrigger>
          </TabsList>

          {/* Tab: Negocio */}
          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle>Datos del Negocio</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  key={config?.id || "new-config"} // remount al crear (evita problemas de defaultValue)
                  onSubmit={handleConfigSubmit}
                  className="space-y-6"
                >
                  {/* Logo */}
                  <div className="space-y-2">
                    <Label>Logo</Label>
                    <div className="flex items-center gap-4">
                      {effectiveLogoUrl ? (
                        <div className="relative">
                          <img
                            src={effectiveLogoUrl}
                            alt="Logo"
                            className="w-24 h-24 object-contain rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-slate-50">
                          <ImageIcon className="w-8 h-8 text-slate-400" />
                        </div>
                      )}

                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload-settings"
                        />
                        <label htmlFor="logo-upload-settings">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={uploadingLogo}
                            onClick={() => document.getElementById("logo-upload-settings").click()}
                            className="cursor-pointer"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {uploadingLogo ? "Subiendo..." : "Cambiar Logo"}
                          </Button>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="business_name">Nombre Comercial</Label>
                      <Input id="business_name" name="business_name" defaultValue={effectiveConfig.business_name} required />
                    </div>
                    <div>
                      <Label htmlFor="cif">CIF/NIF</Label>
                      <Input id="cif" name="cif" defaultValue={effectiveConfig.cif} />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="legal_name">Razón Social</Label>
                      <Input id="legal_name" name="legal_name" defaultValue={effectiveConfig.legal_name} />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Dirección</Label>
                      <Input id="address" name="address" defaultValue={effectiveConfig.address} />
                    </div>
                    <div>
                      <Label htmlFor="city">Ciudad</Label>
                      <Input id="city" name="city" defaultValue={effectiveConfig.city} />
                    </div>
                    <div>
                      <Label htmlFor="postal_code">Código Postal</Label>
                      <Input id="postal_code" name="postal_code" defaultValue={effectiveConfig.postal_code} />
                    </div>
                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input id="phone" name="phone" defaultValue={effectiveConfig.phone} />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" defaultValue={effectiveConfig.email} />
                    </div>
                  </div>

                  <Button type="submit" disabled={upsertConfigMutation.isPending}>
                    {upsertConfigMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Integraciones */}
          <TabsContent value="integrations">
            <div className="space-y-4">
              {Object.entries(INTEGRATION_TYPES).map(([key, integration]) => {
                const existing = integrations.find((i) => i.integration_type === key);
                return (
                  <Card key={key}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">{integration.icon}</span>
                          <div>
                            <h3 className="font-semibold">{integration.name}</h3>
                            <p className="text-sm text-slate-600">{integration.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {existing && (
                            <Badge variant={existing.is_active ? "default" : "secondary"}>
                              {existing.is_active ? "Activa" : "Inactiva"}
                            </Badge>
                          )}
                          <Button variant="outline" onClick={() => openIntegrationForm(key)}>
                            {existing ? "Configurar" : "Conectar"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Integration Form Modal */}
        {editingIntegration && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>
                  {INTEGRATION_TYPES[editingIntegration.type].icon} {INTEGRATION_TYPES[editingIntegration.type].name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleIntegrationSubmit} className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg mb-4">
                    <Label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="is_active"
                        value="true"
                        defaultChecked={editingIntegration.data.is_active}
                        className="h-4 w-4"
                      />
                      Activar integración
                    </Label>
                    <Label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="test_mode"
                        value="true"
                        defaultChecked={editingIntegration.data.test_mode}
                        className="h-4 w-4"
                      />
                      Modo de pruebas
                    </Label>
                  </div>

                  {INTEGRATION_TYPES[editingIntegration.type].fields.map((field) => (
                    <div key={field}>
                      <Label htmlFor={field}>{FIELD_LABELS[field]}</Label>
                      <div className="relative">
                        <Input
                          id={field}
                          name={field}
                          type={showCredentials[field] ? "text" : "password"}
                          defaultValue={editingIntegration.data.credentials?.[field] || ""}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowCredentials({ ...showCredentials, [field]: !showCredentials[field] })
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                        >
                          {showCredentials[field] ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}

                  <div>
                    <Label htmlFor="notes">Notas</Label>
                    <Input
                      id="notes"
                      name="notes"
                      defaultValue={editingIntegration.data.notes}
                      placeholder="Información adicional..."
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setEditingIntegration(null)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Guardar Integración</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
