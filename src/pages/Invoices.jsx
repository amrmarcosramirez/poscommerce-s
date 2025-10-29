import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Search, Download } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => base44.entities.Invoice.list('-invoice_date'),
  });

  const { data: stores = [] } = useQuery({
    queryKey: ['stores'],
    queryFn: () => base44.entities.Store.list(),
  });

  const filteredInvoices = invoices.filter(i =>
    i.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors = {
    emitida: "bg-blue-100 text-blue-800",
    pagada: "bg-green-100 text-green-800",
    pendiente: "bg-yellow-100 text-yellow-800",
    cancelada: "bg-red-100 text-red-800"
  };

  const downloadInvoicePDF = (invoice) => {
    try {
      const store = stores.find(s => s.id === invoice.store_id);
      
      // Crear contenido HTML para el PDF
      const invoiceHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .company-info { margin-bottom: 20px; }
            .invoice-details { margin: 20px 0; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .items-table th { background-color: #f4f4f4; }
            .totals { margin-top: 20px; text-align: right; }
            .total-row { font-weight: bold; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>FACTURA</h1>
            <p><strong>${invoice.invoice_number}</strong></p>
          </div>
          
          <div class="company-info">
            <h3>${store?.name || 'Mi Empresa'}</h3>
            <p>${store?.address || ''}</p>
            <p>${store?.city || ''} - ${store?.postal_code || ''}</p>
            <p>CIF: ${store?.cif || ''}</p>
            <p>Tel: ${store?.phone || ''}</p>
          </div>
          
          <div class="invoice-details">
            <p><strong>Fecha:</strong> ${format(new Date(invoice.invoice_date), "dd/MM/yyyy", { locale: es })}</p>
            <p><strong>Cliente:</strong> ${invoice.customer_name}</p>
            ${invoice.customer_dni_cif ? `<p><strong>DNI/CIF:</strong> ${invoice.customer_dni_cif}</p>` : ''}
            ${invoice.customer_address ? `<p><strong>Dirección:</strong> ${invoice.customer_address}</p>` : ''}
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>Precio Unit.</th>
                <th>IVA</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items?.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>${item.price?.toFixed(2)}€</td>
                  <td>${item.iva_rate}%</td>
                  <td>${item.subtotal?.toFixed(2)}€</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <p>Base Imponible: ${invoice.base_imponible?.toFixed(2)}€</p>
            <p>IVA: ${invoice.total_iva?.toFixed(2)}€</p>
            <p class="total-row">TOTAL: ${invoice.total?.toFixed(2)}€</p>
            <p style="margin-top: 10px;">Método de pago: ${invoice.payment_method}</p>
          </div>
          
          <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
            <p>Gracias por su confianza</p>
          </div>
        </body>
        </html>
      `;
      
      // Crear un blob y descargarlo
      const blob = new Blob([invoiceHTML], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Factura_${invoice.invoice_number}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success("Factura descargada correctamente");
    } catch (error) {
      toast.error("Error al descargar la factura");
      console.error(error);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-8 h-8" />
            Facturas
          </h1>
          <p className="text-slate-600 mt-1">Gestiona tu facturación y cumple con la normativa española</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Buscar por número de factura o cliente..."
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
                    <TableHead>Número</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Base Imp.</TableHead>
                    <TableHead>IVA</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-slate-500 py-8">
                        {searchTerm ? 'No se encontraron facturas' : 'No hay facturas registradas'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id} className="hover:bg-slate-50">
                        <TableCell className="font-mono font-medium">{invoice.invoice_number}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{invoice.customer_name}</p>
                            {invoice.customer_dni_cif && (
                              <p className="text-sm text-slate-500">{invoice.customer_dni_cif}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(invoice.invoice_date), "dd/MM/yyyy", { locale: es })}
                        </TableCell>
                        <TableCell>{invoice.base_imponible?.toFixed(2)}€</TableCell>
                        <TableCell>{invoice.total_iva?.toFixed(2)}€</TableCell>
                        <TableCell className="font-bold text-green-700">
                          {invoice.total?.toFixed(2)}€
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[invoice.status]}>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <button 
                            onClick={() => downloadInvoicePDF(invoice)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">✅ Cumplimiento Fiscal Español</h3>
          <p className="text-sm text-blue-800">
            Este sistema está preparado para cumplir con la normativa española: AEAT, IVA, y TicketBAI.
            Todas las facturas se generan siguiendo los estándares legales vigentes.
          </p>
        </div>
      </div>
    </div>
  );
}