import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Award, Gift, Users, TrendingUp, Star, Crown } from "lucide-react";
import { toast } from "sonner";

const LOYALTY_TIERS = {
  bronce: { name: 'Bronce', min: 0, icon: '🥉', color: 'bg-orange-100 text-orange-800', discount: 0 },
  plata: { name: 'Plata', min: 100, icon: '🥈', color: 'bg-slate-100 text-slate-800', discount: 5 },
  oro: { name: 'Oro', min: 500, icon: '🥇', color: 'bg-yellow-100 text-yellow-800', discount: 10 },
  platino: { name: 'Platino', min: 1000, icon: '💎', color: 'bg-purple-100 text-purple-800', discount: 15 }
};

export default function Loyalty() {
  const queryClient = useQueryClient();
  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [pointsToAdd, setPointsToAdd] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list('-loyalty_points'),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const updatePointsMutation = useMutation({
    mutationFn: ({ customerId, points, tier }) => 
      base44.entities.Customer.update(customerId, { 
        loyalty_points: points,
        loyalty_tier: tier
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setShowRewardDialog(false);
      setSelectedCustomer(null);
      setPointsToAdd(0);
      toast.success("Puntos actualizados correctamente");
    },
  });

  const calculateTier = (points) => {
    if (points >= LOYALTY_TIERS.platino.min) return 'platino';
    if (points >= LOYALTY_TIERS.oro.min) return 'oro';
    if (points >= LOYALTY_TIERS.plata.min) return 'plata';
    return 'bronce';
  };

  const handleAddPoints = (customer) => {
    setSelectedCustomer(customer);
    setShowRewardDialog(true);
  };

  const submitPoints = () => {
    if (!selectedCustomer || pointsToAdd === 0) {
      toast.error("Ingresa una cantidad válida de puntos");
      return;
    }

    const newPoints = (selectedCustomer.loyalty_points || 0) + pointsToAdd;
    const newTier = calculateTier(newPoints);

    updatePointsMutation.mutate({
      customerId: selectedCustomer.id,
      points: newPoints,
      tier: newTier
    });
  };

  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topCustomers = [...customers]
    .sort((a, b) => (b.loyalty_points || 0) - (a.loyalty_points || 0))
    .slice(0, 5);

  const tierStats = Object.keys(LOYALTY_TIERS).map(tier => ({
    tier,
    count: customers.filter(c => c.loyalty_tier === tier).length,
    ...LOYALTY_TIERS[tier]
  }));

  const totalActiveCustomers = customers.filter(c => (c.loyalty_points || 0) > 0).length;
  const avgPoints = customers.reduce((sum, c) => sum + (c.loyalty_points || 0), 0) / (customers.length || 1);

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-8 h-8 text-purple-600" />
            Programa de Fidelización
          </h1>
          <p className="text-slate-600 mt-1">Gestiona puntos y recompensas para tus clientes</p>
        </div>

        {/* Estadísticas */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Clientes Activos</p>
                  <p className="text-3xl font-bold text-blue-600">{totalActiveCustomers}</p>
                </div>
                <Users className="w-12 h-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Puntos Promedio</p>
                  <p className="text-3xl font-bold text-green-600">{avgPoints.toFixed(0)}</p>
                </div>
                <Star className="w-12 h-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Clientes</p>
                  <p className="text-3xl font-bold text-purple-600">{customers.length}</p>
                </div>
                <Gift className="w-12 h-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Nivel Oro+</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {customers.filter(c => c.loyalty_tier === 'oro' || c.loyalty_tier === 'platino').length}
                  </p>
                </div>
                <Crown className="w-12 h-12 text-yellow-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Niveles de Fidelización */}
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b">
              <CardTitle>Niveles de Fidelización</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {tierStats.map(tier => (
                  <div key={tier.tier} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-2xl">{tier.icon}</span>
                      <Badge className={tier.color}>{tier.name}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-1">
                      {tier.count} clientes
                    </p>
                    <p className="text-sm text-slate-600">
                      Descuento: <strong>{tier.discount}%</strong>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Desde {tier.min} puntos
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Clientes */}
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Top 5 Clientes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {topCustomers.map((customer, index) => (
                  <div key={customer.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded">
                    <span className="font-bold text-slate-400 w-6">#{index + 1}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{customer.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={LOYALTY_TIERS[customer.loyalty_tier]?.color || 'bg-slate-100'} variant="outline">
                          {LOYALTY_TIERS[customer.loyalty_tier]?.icon} {LOYALTY_TIERS[customer.loyalty_tier]?.name}
                        </Badge>
                      </div>
                    </div>
                    <p className="font-bold text-purple-600">{customer.loyalty_points || 0} pts</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Configuración de Puntos */}
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b">
              <CardTitle>⚙️ Configuración</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1">Conversión de Puntos</p>
                  <p className="text-xs text-blue-800">1€ gastado = 1 punto</p>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-900 mb-1">Canje de Puntos</p>
                  <p className="text-xs text-green-800">100 puntos = 5€ descuento</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Productos con Puntos Extra:</p>
                  {products.filter(p => p.loyalty_points > 0).slice(0, 3).map(product => (
                    <div key={product.id} className="flex justify-between text-xs p-2 bg-slate-50 rounded">
                      <span>{product.name}</span>
                      <span className="font-bold text-purple-600">+{product.loyalty_points} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Clientes */}
        <Card className="shadow-lg border-0">
          <CardHeader className="border-b">
            <CardTitle>Gestión de Puntos</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-4">
              <Input
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Nivel</TableHead>
                    <TableHead>Puntos</TableHead>
                    <TableHead>Compras</TableHead>
                    <TableHead>Descuento</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map(customer => {
                    const tier = LOYALTY_TIERS[customer.loyalty_tier || 'bronce'];
                    return (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.email || '-'}</TableCell>
                        <TableCell>
                          <Badge className={tier.color}>
                            {tier.icon} {tier.name}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold text-purple-600">
                          {customer.loyalty_points || 0} pts
                        </TableCell>
                        <TableCell>
                          {customer.purchase_count || 0} ({(customer.total_purchases || 0).toFixed(2)}€)
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{tier.discount}%</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddPoints(customer)}
                          >
                            <Gift className="w-4 h-4 mr-1" />
                            Dar Puntos
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Dialog para añadir puntos */}
        <Dialog open={showRewardDialog} onOpenChange={setShowRewardDialog}>
          <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>Añadir/Restar Puntos</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-2">Cliente: <strong>{selectedCustomer?.name}</strong></p>
                <p className="text-sm text-slate-600">
                  Puntos actuales: <strong className="text-purple-600">{selectedCustomer?.loyalty_points || 0}</strong>
                </p>
                <p className="text-sm text-slate-600">
                  Nivel actual: <Badge className={LOYALTY_TIERS[selectedCustomer?.loyalty_tier || 'bronce'].color}>
                    {LOYALTY_TIERS[selectedCustomer?.loyalty_tier || 'bronce'].icon} {LOYALTY_TIERS[selectedCustomer?.loyalty_tier || 'bronce'].name}
                  </Badge>
                </p>
              </div>

              <div className="space-y-2">
                <Label>Puntos a añadir/restar</Label>
                <Input
                  type="number"
                  value={pointsToAdd}
                  onChange={(e) => setPointsToAdd(parseInt(e.target.value) || 0)}
                  placeholder="Ej: 50 o -20"
                />
                <p className="text-xs text-slate-500">
                  Usa números negativos para restar puntos
                </p>
              </div>

              {pointsToAdd !== 0 && selectedCustomer && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    Nuevos puntos: <strong>{(selectedCustomer.loyalty_points || 0) + pointsToAdd}</strong>
                  </p>
                  <p className="text-sm text-blue-900">
                    Nuevo nivel: <Badge className={LOYALTY_TIERS[calculateTier((selectedCustomer.loyalty_points || 0) + pointsToAdd)].color}>
                      {LOYALTY_TIERS[calculateTier((selectedCustomer.loyalty_points || 0) + pointsToAdd)].icon} {LOYALTY_TIERS[calculateTier((selectedCustomer.loyalty_points || 0) + pointsToAdd)].name}
                    </Badge>
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowRewardDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={submitPoints} className="bg-purple-600 hover:bg-purple-700">
                  Confirmar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Información */}
        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-purple-900 mb-2">💡 Cómo funciona el Programa de Fidelización</h3>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• Los clientes ganan 1 punto por cada euro gastado</li>
            <li>• Los niveles otorgan descuentos automáticos: Bronce (0%), Plata (5%), Oro (10%), Platino (15%)</li>
            <li>• Puedes asignar puntos extra a productos específicos desde la gestión de productos</li>
            <li>• Los puntos se pueden canjear: 100 puntos = 5€ de descuento</li>
          </ul>
        </div>
      </div>
    </div>
  );
}