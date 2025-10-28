import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function TicketModal({ sale, store, onClose }) {
  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=300,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket ${sale.sale_number}</title>
          <style>
            body { 
              font-family: monospace; 
              font-size: 11px;
              margin: 10px;
              width: 280px;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed #000; margin: 5px 0; }
            .row { display: flex; justify-content: space-between; margin: 2px 0; }
            .total { font-size: 14px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="center bold">${store?.name || 'Mi Tienda'}</div>
          <div class="center">${store?.address || ''}</div>
          <div class="center">${store?.city || ''} ${store?.postal_code || ''}</div>
          <div class="center">Tel: ${store?.phone || ''}</div>
          <div class="center">CIF: ${store?.cif || ''}</div>
          <div class="line"></div>
          <div class="row"><span>Ticket:</span><span class="bold">${sale.sale_number}</span></div>
          <div class="row"><span>Fecha:</span><span>${format(new Date(sale.sale_date), "dd/MM/yy HH:mm")}</span></div>
          ${sale.customer_name !== "Cliente general" ? `<div class="row"><span>Cliente:</span><span>${sale.customer_name}</span></div>` : ''}
          <div class="row"><span>Pago:</span><span>${sale.payment_method.toUpperCase()}</span></div>
          <div class="line"></div>
          ${sale.items.map(item => `
            <div class="row bold"><span>${item.product_name}</span><span>${item.subtotal.toFixed(2)}€</span></div>
            <div class="row" style="font-size: 10px;"><span>${item.quantity} x ${item.price.toFixed(2)}€</span><span>IVA ${item.iva_rate}%</span></div>
          `).join('')}
          <div class="line"></div>
          <div class="row"><span>Subtotal:</span><span>${sale.subtotal.toFixed(2)}€</span></div>
          ${sale.discount > 0 ? `<div class="row"><span>Desc. (${sale.discount}%):</span><span>-${((sale.subtotal * sale.discount) / 100).toFixed(2)}€</span></div>` : ''}
          <div class="row"><span>IVA:</span><span>${sale.total_iva.toFixed(2)}€</span></div>
          <div class="line"></div>
          <div class="row total"><span>TOTAL:</span><span>${sale.total.toFixed(2)}€</span></div>
          <div class="line"></div>
          <div class="center">¡Gracias por su compra!</div>
          <div class="center" style="font-size: 9px;">Ticket válido como comprobante</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  if (!sale) return null;

  return (
    <Dialog open={!!sale} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-xs p-4" 
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="space-y-3">
          <h3 className="font-bold text-center text-lg">Ticket de Venta</h3>
          
          {/* Ticket Preview Mini */}
          <div className="bg-slate-50 rounded p-3 font-mono text-xs border max-h-[50vh] overflow-y-auto">
            <div className="text-center border-b border-dashed pb-2 mb-2">
              <div className="font-bold">{store?.name || 'Mi Tienda'}</div>
              {store?.address && <div className="text-xs">{store.address}</div>}
              {store?.city && <div className="text-xs">{store.city}</div>}
            </div>
            
            <div className="space-y-1 mb-2">
              <div className="flex justify-between">
                <span>Ticket:</span>
                <span className="font-bold">{sale.sale_number}</span>
              </div>
              <div className="flex justify-between">
                <span>Fecha:</span>
                <span>{format(new Date(sale.sale_date), "dd/MM/yy HH:mm", { locale: es })}</span>
              </div>
              {sale.customer_name !== "Cliente general" && (
                <div className="flex justify-between">
                  <span>Cliente:</span>
                  <span className="truncate ml-2">{sale.customer_name}</span>
                </div>
              )}
            </div>

            <div className="border-t border-b border-dashed py-2 mb-2 space-y-1">
              {sale.items?.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between font-semibold">
                    <span className="truncate mr-2">{item.product_name}</span>
                    <span>{item.subtotal.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{item.quantity} x {item.price.toFixed(2)}€</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-1 mb-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{sale.subtotal?.toFixed(2)}€</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Desc. ({sale.discount}%):</span>
                  <span>-{((sale.subtotal * sale.discount) / 100).toFixed(2)}€</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>IVA:</span>
                <span>{sale.total_iva?.toFixed(2)}€</span>
              </div>
            </div>

            <div className="border-t border-dashed pt-2">
              <div className="flex justify-between text-sm font-bold">
                <span>TOTAL:</span>
                <span>{sale.total?.toFixed(2)}€</span>
              </div>
            </div>

            <div className="text-center text-xs mt-2 pt-2 border-t border-dashed">
              <div>¡Gracias por su compra!</div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-2">
            <Button onClick={handlePrint} className="flex-1 bg-blue-600 hover:bg-blue-700 h-9">
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1 h-9">
              <X className="w-4 h-4 mr-2" />
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}