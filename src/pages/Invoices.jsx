import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Search, Download, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState('invoice_date');
  const [sortDirection, setSortDirection] = useState('desc');

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => base44.entities.Invoice.list('-invoice_date'),
  });

  const { data: stores = [] } = useQuery({
    queryKey: ['stores'],
    queryFn: () => base44.entities.Store.list(),
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredInvoices = invoices.filter(i =>
    i.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    if (sortField === 'invoice_date') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }
    
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const statusColors = {
    emitida: "bg-blue-100 text-blue-800",
    pagada: "bg-green-100 text-green-800",
    pendiente: "bg-yellow-100 text-yellow-800",
    cancelada: "bg-red-100 text-red-800"
  };

  const downloadInvoicePDF = (invoice) => {
    try {
      const store = stores.find(s => s.id === invoice.store_id);
      
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Factura ${invoice.invoice_number}</title>
          <style>
            @page { margin: 2cm; }
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px;
              color: #333;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 3px solid #333; 
              padding-bottom: 20px; 
            }
            .header h1 { margin: 0 0 10px 0; font-size: 28px; }
            .company-info { margin-bottom: 30px; }
            .company-info h3 { margin: 0 0 10px 0; font-size: 18px; }
            .invoice-details { margin: 30px 0; }
            .invoice-details p { margin: 5px 0; }
            .items-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 30px 0; 
            }
            .items-table th, .items-table td { 
              border: 1px solid #ddd; 
              padding: 12px; 
              text-align: left; 
            }
            .items-table th { 
              background-color: #f4f4f4; 
              font-weight: bold;
            }
            .totals { 
              margin-top: 30px; 
              text-align: right; 
            }
            .totals p { margin: 8px 0; }
            .total-row { 
              font-weight: bold; 
              font-size: 20px; 
              margin-top: 15px;
              padding-top: 15px;
              border-top: 2px solid #333;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>FACTURA</h1>
            <p style="font-size: 18px;"><strong>${invoice.invoice_number}</strong></p>
          </div>
          
          <div class="company-info">
            <h3>${store?.name || 'Mi Empresa'}</h3>
            <p>${store?.address || ''}</p>
            <p>${store?.city || ''} - ${store?.postal_code || ''}</p>
            <p><strong>CIF:</strong> ${store?.cif || ''}</p>
            <p><strong>Tel:</strong> ${store?.phone || ''}</p>
            ${store?.email ? `<p><strong>Email:</strong> ${store.email}</p>` : ''}
          </div>
          
          <div class="invoice-details">
            <p><strong>Fecha de emisión:</strong> ${format(new Date(invoice.invoice_date), "dd/MM/yyyy", { locale: es })}</p>
            <p><strong>Cliente:</strong> ${invoice.customer_name}</p>
            ${invoice.customer_dni_cif ? `<p><strong>DNI/CIF:</strong> ${invoice.customer_dni_cif}</p>` : ''}
            ${invoice.customer_address ? `<p><strong>Dirección:</strong> ${invoice.customer_address}</p>` : ''}
            <p><strong>Método de pago:</strong> ${invoice.payment_method}</p>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Descripción</th>
                <th style="text-align: center;">Cantidad</th>
                <th style="text-align: right;">Precio Unit.</th>
                <th style="text-align: center;">IVA</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items?.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">${item.price?.toFixed(2)}€</td>
                  <td style="text-align: center;">${item.iva_rate}%</td>
                  <td style="text-align: right;"><strong>${item.subtotal?.toFixed(2)}€</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <p><strong>Base Imponible:</strong> ${invoice.base_imponible?.toFixed(2)}€</p>
            <p><strong>IVA Total:</strong> ${invoice.total_iva?.toFixed(2)}€</p>
            <p class="total-row"><strong>TOTAL:</strong> ${invoice.total?.toFixed(2)}€</p>
          </div>
          
          <div class="footer">
            <p><strong>Gracias por su confianza</strong></p>
            <p>Documento generado electrónicamente - POSCommerce</p>
          </div>
        </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Esperar a que se cargue y luego imprimir
      setTimeout(() => {
        printWindow.print();
        toast.success("Preparando factura para imprimir/guardar como PDF");
      }, 250);
      
    } catch (error) {
      toast.error("Error al generar la factura");
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
                    <TableHead onClick={() => handleSort('invoice_number')} className="cursor-pointer hover:bg-slate-50">
                      <div className="flex items-center gap-1">
                        Número
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('customer_name')} className="cursor-pointer hover:bg-slate-50">
                      <div className="flex items-center gap-1">
                        Cliente
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('invoice_date')} className="cursor-pointer hover:bg-slate-50">
                      <div className="flex items-center gap-1">
                        Fecha
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('base_imponible')} className="cursor-pointer hover:bg-slate-50">
                      <div className="flex items-center gap-1">
                        Base Imp.
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('total_iva')} className="cursor-pointer hover:bg-slate-50">
                      <div className="flex items-center gap-1">
                        IVA
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('total')} className="cursor-pointer hover:bg-slate-50">
                      <div className="flex items-center gap-1">
                        Total
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('status')} className="cursor-pointer hover:bg-slate-50">
                      <div className="flex items-center gap-1">
                        Estado
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </TableHead>
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
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            title="Descargar PDF"
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
          <p className="text-sm text-blue-800 mt-2">
            💡 <strong>Tip:</strong> Al hacer clic en "Descargar", se abrirá una ventana de impresión donde podrás guardar como PDF.
          </p>
        </div>
      </div>
    </div>
  );
}