import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store, Plus, Edit, MapPin, Globe } from "lucide-react";
import { toast } from "sonner";

export default function Stores() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    postal_code: "",
    phone: "",
    email: "",
    cif: "",
    store_type: "fisica",
    online_url: "",
    is_active: true
  });

  const { data: stores = [] } = useQuery({
    queryKey: ['stores'],
    queryFn: () => base44.entities.Store.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Store.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success("Tienda creada exitosamente");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Store.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success("Tienda actualizada exitosamente");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      city: "",
      postal_code: "",
      phone: "",
      email: "",
      cif: "",
      store_type: "fisica",
      online_url: "",
      is_active: true
    });
    setEditingStore(null);
  };

  const handleEdit = (store) => {
    setEditingStore(store);
    setFormData(store);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingStore) {
      updateMutation.mutate({ id: editingStore.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const physicalStores = stores.filter(s => s.store_type === 'fisica');
  const onlineStores = stores.filter(s => s.store_type === 'online');

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Store className="w-8 h-8" />
              Gestión de Tiendas
            </h1>
            <p className="text-slate-600 mt-1">Administra tus tiendas físicas y online</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
                <Plus className="w-5 h-5 mr-2" />
                Nueva Tienda
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" onPointerDownOutside={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle>
                  {editingStore ? "Editar Tienda" : "Nueva Tienda"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name">Nombre de la Tienda *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="store_type">Tipo de Tienda *</Label>
                    <Select value={formData.store_type} onValueChange={(value) => setFormData({...formData, store_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fisica">🏪 Tienda Física</SelectItem>
                        <SelectItem value="online">🌐 Tienda Online</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.store_type === 'online' && (
                    <div className="space-y-2">
                      <Label htmlFor="online_url">URL de la Tienda Online</Label>
                      <Input
                        id="online_url"
                        value={formData.online_url}
                        onChange={(e) => setFormData({...formData, online_url: e.target.value})}
                        placeholder="https://mitienda.com"
                      />
                    </div>
                  )}

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Código Postal</Label>
                    <Input
                      id="postal_code"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="cif">CIF</Label>
                    <Input
                      id="cif"
                      value={formData.cif}
                      onChange={(e) => setFormData({...formData, cif: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      />
                      Tienda activa
                    </Label>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingStore ? "Actualizar" : "Crear"} Tienda
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tiendas Físicas */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Store className="w-6 h-6" />
            Tiendas Físicas
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {physicalStores.map((store) => (
              <Card key={store.id} className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                        <Store className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{store.name}</h3>
                        <Badge variant={store.is_active ? "default" : "secondary"}>
                          {store.is_active ? "Activa" : "Inactiva"}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(store)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {store.address && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-slate-700">{store.address}</p>
                          <p className="text-slate-500">
                            {store.city} {store.postal_code && `- ${store.postal_code}`}
                          </p>
                        </div>
                      </div>
                    )}
                    {store.phone && (
                      <p className="text-sm text-slate-600">📞 {store.phone}</p>
                    )}
                    {store.email && (
                      <p className="text-sm text-slate-600">📧 {store.email}</p>
                    )}
                    {store.cif && (
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">CIF:</span> {store.cif}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tiendas Online */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Globe className="w-6 h-6 text-purple-600" />
            Tiendas Online
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {onlineStores.map((store) => (
              <Card key={store.id} className="shadow-lg border-0 hover:shadow-xl transition-shadow border-2 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
                        <Globe className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{store.name}</h3>
                        <Badge variant={store.is_active ? "default" : "secondary"}>
                          {store.is_active ? "Activa" : "Inactiva"}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(store)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {store.online_url && (
                      <a 
                        href={store.online_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-2"
                      >
                        🌐 {store.online_url}
                      </a>
                    )}
                    {store.phone && (
                      <p className="text-sm text-slate-600">📞 {store.phone}</p>
                    )}
                    {store.email && (
                      <p className="text-sm text-slate-600">📧 {store.email}</p>
                    )}
                    {store.cif && (
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">CIF:</span> {store.cif}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {stores.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <Store className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                No hay tiendas registradas
              </h3>
              <p className="text-slate-500 mb-4">
                Crea tu primera tienda (física u online) para empezar a gestionar tus ventas
              </p>
              <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-5 h-5 mr-2" />
                Crear Primera Tienda
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}