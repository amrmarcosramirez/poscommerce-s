import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store, Building2, CreditCard, CheckCircle, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";

const PLANS = {
  basico: {
    name: "Plan Básico",
    price: "29€/mes",
    limits: {
      max_stores: 1,
      max_products: 100,
      max_users: 2,
      features: ["pos", "ecommerce", "basic_reports"]
    },
    description: "Perfecto para empezar"
  },
  estandar: {
    name: "Plan Estándar",
    price: "79€/mes",
    limits: {
      max_stores: 3,
      max_products: -1,
      max_users: 5,
      features: ["pos", "ecommerce", "advanced_reports", "loyalty", "integrations"]
    },
    description: "Para negocios en crecimiento"
  },
  premium: {
    name: "Plan Premium",
    price: "149€/mes",
    limits: {
      max_stores: -1,
      max_products: -1,
      max_users: -1,
      features: ["pos", "ecommerce", "advanced_reports", "loyalty", "integrations", "ticketbai", "multi_warehouse", "api_access"]
    },
    description: "Sin límites para empresas"
  }
};

export default function Onboarding() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [formData, setFormData] = useState({
    business_name: "",
    cif: "",
    legal_name: "",
    address: "",
    city: "",
    postal_code: "",
    phone: "",
    email: "",
    logo_url: "",
    plan: "basico"
  });

  const createConfigMutation = useMutation({
    mutationFn: async (data) => {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 14); // 14 días de prueba

      const config = await base44.entities.BusinessConfig.create({
        ...data,
        plan_limits: PLANS[data.plan].limits,
        onboarding_completed: true,
        trial_ends_at: trialEndsAt.toISOString(),
        subscription_status: "trial"
      });
      return config;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessConfig'] });
      toast.success("¡Configuración completada! 🎉 Tienes 14 días de prueba gratis");
      setTimeout(() => {
        window.location.href = createPageUrl("Dashboard");
      }, 1500);
    },
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, logo_url: file_url });
      toast.success("Logo subido correctamente");
    } catch (error) {
      toast.error("Error al subir el logo");
    }
    setUploadingLogo(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.business_name || !formData.cif) {
      toast.error("Completa los campos obligatorios");
      return;
    }
    createConfigMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <Card className="max-w-3xl w-full shadow-2xl border-0">
        <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl text-center">
            🎉 Bienvenido a POSCommerce
          </CardTitle>
          <p className="text-center text-blue-100 mt-2">
            Configura tu negocio en 3 sencillos pasos
          </p>
        </CardHeader>

        <CardContent className="p-8">
          {/* Progress */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {step > s ? <CheckCircle className="w-6 h-6" /> : s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > s ? 'bg-blue-600' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Datos del Negocio */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="text-center mb-6">
                  <Building2 className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                  <h3 className="text-xl font-bold">Datos de tu Negocio</h3>
                  <p className="text-slate-600">Información básica para empezar</p>
                </div>

                <div className="space-y-4">
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
              </div>
            )}

            {/* Step 2: Logo y Personalización */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="text-center mb-6">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 text-purple-600" />
                  <h3 className="text-xl font-bold">Personaliza tu Marca</h3>
                  <p className="text-slate-600">Sube tu logo (opcional)</p>
                </div>

                <div className="flex flex-col items-center gap-4">
                  {formData.logo_url ? (
                    <div className="relative">
                      <img
                        src={formData.logo_url}
                        alt="Logo"
                        className="w-48 h-48 object-contain rounded-lg border-2 border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, logo_url: ""})}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="w-48 h-48 border-2 border-dashed rounded-lg flex items-center justify-center bg-slate-50">
                      <ImageIcon className="w-16 h-16 text-slate-400" />
                    </div>
                  )}

                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploadingLogo}
                        onClick={() => document.getElementById('logo-upload').click()}
                        className="cursor-pointer"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadingLogo ? "Subiendo..." : "Subir Logo"}
                      </Button>
                    </label>
                    <p className="text-xs text-slate-500 mt-2 text-center">
                      Puedes saltarte este paso y configurarlo después
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Selección de Plan */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="text-center mb-6">
                  <CreditCard className="w-16 h-16 mx-auto mb-4 text-green-600" />
                  <h3 className="text-xl font-bold">Elige tu Plan</h3>
                  <p className="text-slate-600">Puedes cambiar en cualquier momento</p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {Object.entries(PLANS).map(([key, plan]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData({...formData, plan: key})}
                      className={`p-6 border-2 rounded-xl text-left transition-all ${
                        formData.plan === key
                          ? 'border-blue-600 bg-blue-50 shadow-lg'
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <h4 className="font-bold text-lg mb-2">{plan.name}</h4>
                      <p className="text-2xl font-bold text-blue-600 mb-2">{plan.price}</p>
                      <p className="text-sm text-slate-600 mb-4">{plan.description}</p>
                      <div className="space-y-1 text-xs">
                        <p>• {plan.limits.max_stores === -1 ? 'Tiendas ilimitadas' : `${plan.limits.max_stores} tienda(s)`}</p>
                        <p>• {plan.limits.max_products === -1 ? 'Productos ilimitados' : `${plan.limits.max_products} productos`}</p>
                        <p>• {plan.limits.max_users === -1 ? 'Usuarios ilimitados' : `${plan.limits.max_users} usuarios`}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <p className="text-xs text-center text-slate-500">
                  💳 El pago se activará automáticamente tras el periodo de prueba de 14 días
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                >
                  ← Anterior
                </Button>
              )}
              
              {step < 3 ? (
                <Button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="ml-auto bg-blue-600 hover:bg-blue-700"
                >
                  Siguiente →
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={createConfigMutation.isPending}
                  className="ml-auto bg-green-600 hover:bg-green-700 text-lg px-8"
                >
                  {createConfigMutation.isPending ? "Guardando..." : "🚀 Empezar a Vender"}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}