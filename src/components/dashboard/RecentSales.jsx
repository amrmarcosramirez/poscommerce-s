import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, CreditCard, Smartphone } from "lucide-react";

const paymentIcons = {
  efectivo: '💵',
  tarjeta: <CreditCard className="w-4 h-4" />,
  bizum: <Smartphone className="w-4 h-4" />,
  transferencia: '🏦'
};

export default function RecentSales({ sales, isLoading }) {
  if (isLoading) {
    return (
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Ventas Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          Ventas Recientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                    No hay ventas registradas
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale) => (
                  <TableRow key={sale.id} className="hover:bg-slate-50">
                    <TableCell className="font-mono text-sm">{sale.sale_number}</TableCell>
                    <TableCell className="font-medium">{sale.customer_name || 'Cliente general'}</TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {format(new Date(sale.sale_date), "d MMM, HH:mm", { locale: es })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {paymentIcons[sale.payment_method]}
                        <span className="text-sm capitalize">{sale.payment_method}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={sale.channel === 'tienda_fisica' ? 'default' : 'secondary'}>
                        {sale.channel === 'tienda_fisica' ? '🏪 Física' : '🌐 Online'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-700">
                      {sale.total.toFixed(2)}€
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}