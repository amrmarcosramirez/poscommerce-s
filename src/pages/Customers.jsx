import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Search, Edit, Trash2, User } from "lucide-react";
import { toast } from "sonner";

// Función para formatear nombres con mayúscula inicial
const formatName = (name) => {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Validación de email
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Validación de teléfono español
const isValidPhone = (phone) => {
  return /^(\+34|0034|34)?[6789]\d{8}$/.test(phone.replace(/\s/g, ''));
};

// Validación de DNI/NIE/CIF
const isValidDniCif = (value) => {
  const dniRegex = /^\d{8}[A-Z]$/;
  const nieRegex = /^[XYZ]\d{7}[A-Z]$/;
  const cifRegex = /^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/;
  
  return dniRegex.test(value) || nieRegex.test(value) || cifRegex.test(value);
};

export default function Customers() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dni_cif: "",
    address: "",
    city: "",
    postal_code: "",
    customer_type: "particular",
    notes: ""
  });

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Customer.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success("Cliente creado exitosamente");
    },
    onError: (error) => {
      toast.error("Error al crear cliente: " + error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Customer.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success("Cliente actualizado exitosamente");
    },
    onError: (error) => {
      toast.error("Error al actualizar cliente: " + error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Customer.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success("Cliente eliminado");
    },
  });

  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      dni_cif: "",
      address: "",
      city: "",
      postal_code: "",
      customer_type: "particular",
      notes: ""
    });
    setEditingCustomer(null);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData(customer);
    setIsDialogOpen(true);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("El nombre es obligatorio");
      return false;
    }

    if (formData.email && !isValidEmail(formData.email)) {
      toast.error("Email no válido");
      return false;
    }

    if (formData.email) {
      const emailExists = customers.some(c => 
        c.email?.toLowerCase() === formData.email.toLowerCase() && 
        c.id !== editingCustomer?.id
      );
      if (emailExists) {
        toast.error("Ya existe un cliente con este email");
        return false;
      }
    }

    if (formData.phone && !isValidPhone(formData.phone)) {
      toast.error("Teléfono no válido. Debe ser un número español");
      return false;
    }

    if (formData.phone) {
      const phoneExists = customers.some(c => 
        c.phone === formData.phone && 
        c.id !== editingCustomer?.id
      );
      if (phoneExists) {
        toast.error("Ya existe un cliente con este teléfono");
        return false;
      }
    }

    if (formData.dni_cif) {
      const upperDniCif = formData.dni_cif.toUpperCase();
      if (!isValidDniCif(upperDniCif)) {
        toast.error("DNI/NIE/CIF no válido");
        return false;
      }

      const dniCifExists = customers.some(c => 
        c.dni_cif?.toUpperCase() === upperDniCif && 
        c.id !== editingCustomer?.id
      );
      if (dniCifExists) {
        toast.error("Ya existe un cliente con este DNI/CIF");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const formattedData = {
      ...formData,
      name: formatName(formData.name),
      city: formData.city ? formatName(formData.city) : "",
      dni_cif: formData.dni_cif ? formData.dni_cif.toUpperCase() : "",
      email: formData.email ? formData.email.toLowerCase() : ""
    };

    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, data: formattedData });
    } else {
      createMutation.mutate(formattedData);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-8 h-8" />
              Gestión de Clientes
            </h1>
            <p className="text-slate-600 mt-1">Administra tu base de clientes</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open && !createMutation.isPending && !updateMutation.isPending) setIsDialogOpen(false); }}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent 
              className="max-w-2xl max-h-[90vh] overflow-y-auto" 
              onPointerDownOutside={(e) => e.preventDefault()}
              onEscapeKeyDown={(e) => e.preventDefault()}
              onInteractOutside={(e) => e.preventDefault()}
            >
              <DialogHeader>
                <DialogTitle>
                  {editingCustomer ? "Editar Cliente" : "Nuevo Cliente"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name">Nombre Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Juan Pérez García"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="juan@ejemplo.com"
                    />
                    <p className="text-xs text-slate-500">Debe ser único en el sistema</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+34 600 123 456"
                    />
                    <p className="text-xs text-slate-500">Formato español (+34)</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer_type">Tipo de Cliente</Label>
                    <Select value={formData.customer_type} onValueChange={(value) => setFormData({...formData, customer_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="particular">Particular</SelectItem>
                        <SelectItem value="empresa">Empresa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dni_cif">DNI/NIE/CIF</Label>
                    <Input
                      id="dni_cif"
                      value={formData.dni_cif}
                      onChange={(e) => setFormData({...formData, dni_cif: e.target.value.toUpperCase()})}
                      placeholder="12345678A"
                      maxLength={9}
                    />
                    <p className="text-xs text-slate-500">Formato: 12345678A o B12345678</p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Calle Mayor 123"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder="Madrid"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Código Postal</Label>
                    <Input
                      id="postal_code"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                      placeholder="28001"
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes">Notas</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Información adicional del cliente"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingCustomer ? "Actualizar" : "Crear"} Cliente
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Buscar clientes por nombre, email o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Ciudad</TableHead>
                    <TableHead>Compras</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{customer.name}</p>
                            {customer.dni_cif && <p className="text-sm text-slate-500">{customer.dni_cif}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {customer.email && <p className="text-sm">{customer.email}</p>}
                          {customer.phone && <p className="text-sm text-slate-600">{customer.phone}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={customer.customer_type === 'empresa' ? 'default' : 'secondary'}>
                          {customer.customer_type === 'empresa' ? '🏢 Empresa' : '👤 Particular'}
                        </Badge>
                      </TableCell>
                      <TableCell>{customer.city || '-'}</TableCell>
                      <TableCell>{customer.purchase_count || 0} pedidos</TableCell>
                      <TableCell className="text-right font-semibold text-green-700">
                        {(customer.total_purchases || 0).toFixed(2)}€
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(customer)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("¿Eliminar este cliente?")) {
                                deleteMutation.mutate(customer.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}