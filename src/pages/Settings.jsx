import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, Building2, CreditCard, Plug, Upload, Image as ImageIcon, X, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";

const INTEGRATION_TYPES = {
  redsys: { name: "Redsys (TPV Bancario)", icon: "💳", description: "Pasarela de pago española", fields: ["merchant_code", "secret_key", "terminal"] },
  stripe: { name: "Stripe", icon: "💳", description: "Pasarela de pago internacional", fields: ["api_key", "webhook_secret"] },
  twilio: { name: "Twilio SMS", icon: "📱", description: "Envío de SMS a clientes", fields: ["account_sid", "auth_token", "phone_number"] },
  correos: { name: "Correos Express", icon: "📦", description: "Integración con Correos", fields: ["api_key", "api_url"] },
  mrw: { name: "MRW", icon: "🚚", description: "Mensajería MRW", fields: ["api_key"] },
  seur: { name: "SEUR", icon: "📮", description: "Mensajería SEUR", fields: ["api_key"] }
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
  webhook_secret: "Webhook Secret"
};

export default function Settings() {
  const queryClient = useQueryClient();
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState(null);
  const [showCredentials, setShowCredentials] = useState({});

  const { data: config, isLoading: loadingConfig } = useQuery({
    queryKey: ['businessConfig'],
    queryFn: async () => {
      const configs = await base44.entities.BusinessConfig.list();
      return configs[0] || null;
    },
  });

  const { data: integrations = [] } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => base44.entities.Integration.list(),
  });

  const updateConfigMutation = useMutation({
    mutationFn: (data) => base44.entities.BusinessConfig.update(config.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessConfig'] });
      toast.success("Configuración actualizada");
    },
  });

  const createIntegrationMutation = useMutation({
    mutationFn: (data) => base44.entities.Integration.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      setEditingIntegration(null);
      toast.success("Integración configurada");
    },
  });

  const updateIntegrationMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Integration.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      setEditingIntegration(null);
      toast.success("Integración actualizada");
    },
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      updateConfigMutation.mutate({ logo_url: file_url });
    } catch (error) {
      toast.error("Error al subir el logo");
    }
    setUploadingLogo(false);
  };

  const handleConfigSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    updateConfigMutation.mutate(data);
  };

  const handleIntegrationSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      integration_type: editingIntegration.type,
      is_active: formData.get('is_active') === 'true',
      test_mode: formData.get('test_mode') === 'true',
      credentials: {},
      notes: formData.get('notes') || ""
    };

    INTEGRATION_TYPES[editingIntegration.type].fields.forEach(field => {
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
    const existing = integrations.find(i => i.integration_type === type);
    setEditingIntegration({
      type,
      id: existing?.id,
      data: existing || { is_active: false, test_mode: true, credentials: {} }
    });
  };

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

        <Tabs defaultValue="business" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="business">
              <Building2 className="w-4 h-4 mr-2" />
              Negocio
            </TabsTrigger>
            <TabsTrigger value="plan">
              <CreditCard className="w-4 h-4 mr-2" />
              Plan y Límites
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
                <form onSubmit={handleConfigSubmit} className="space-y-6">
                  {/* Logo */}
                  <div className="space-y-2">
                    <Label>Logo</Label>
                    <div className="flex items-center gap-4">
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
                            onClick={() => document.getElementById('logo-upload-settings').click()}
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
                      <Label htmlFor="business_name">Nombre Comercial *</Label>
                      <Input
                        id="business_name"
                        value={formData.business_name}
                        onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                        placeholder="Ej: Boutique María"
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cif">CIF/NIF *</Label>
                        <Input
                          id="cif"
                          value={formData.cif}
                          onChange={(e) => setFormData({...formData, cif: e.target.value})}
                          placeholder="Ej: B12345678"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="legal_name">Razón Social</Label>
                        <Input
                          id="legal_name"
                          value={formData.legal_name}
                          onChange={(e) => setFormData({...formData, legal_name: e.target.value})}
                          placeholder="Nombre legal de la empresa"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Dirección</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        placeholder="Calle, número, piso..."
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">Ciudad</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          placeholder="Madrid, Barcelona..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="postal_code">Código Postal</Label>
                        <Input
                          id="postal_code"
                          value={formData.postal_code}
                          onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                          placeholder="28001"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="+34 600 000 000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="contacto@tunegocio.com"
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={updateConfigMutation.isPending}>
                    {updateConfigMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Integraciones */}
          <TabsContent value="integrations">
            <div className="space-y-4">
              {Object.entries(INTEGRATION_TYPES).map(([key, integration]) => {
                const existing = integrations.find(i => i.integration_type === key);
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
                          <Button
                            variant="outline"
                            onClick={() => openIntegrationForm(key)}
                          >
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

                  {INTEGRATION_TYPES[editingIntegration.type].fields.map(field => (
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
                          onClick={() => setShowCredentials({...showCredentials, [field]: !showCredentials[field]})}
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
                    <Button type="submit">
                      Guardar Integración
                    </Button>
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