import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function TicketModal({ sale, store, onClose }) {
  const ticketRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  if (!sale) return null;

  return (
    <Dialog open={!!sale} onOpenChange={() => {}}>
      <DialogContent className="max-w-sm p-0" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="text-lg">Ticket de Venta</DialogTitle>
        </DialogHeader>

        {/* Ticket */}
        <div ref={ticketRef} className="bg-white px-4 pb-4 font-mono text-xs max-h-[60vh] overflow-y-auto">
          {/* Encabezado */}
          <div className="text-center border-b border-dashed pb-2 mb-2">
            <h1 className="text-sm font-bold mb-1">{store?.name || 'Mi Tienda'}</h1>
            {store?.address && <p className="text-xs">{store.address}</p>}
            {store?.city && <p className="text-xs">{store.city} - {store.postal_code}</p>}
            {store?.phone && <p className="text-xs">Tel: {store.phone}</p>}
            {store?.cif && <p className="text-xs">CIF: {store.cif}</p>}
          </div>

          {/* Información de la venta */}
          <div className="mb-2 text-xs space-y-0.5">
            <div className="flex justify-between">
              <span>Ticket:</span>
              <span className="font-bold">{sale.sale_number}</span>
            </div>
            <div className="flex justify-between">
              <span>Fecha:</span>
              <span>{format(new Date(sale.sale_date), "dd/MM/yy HH:mm", { locale: es })}</span>
            </div>
            {sale.customer_name && sale.customer_name !== "Cliente general" && (
              <div className="flex justify-between">
                <span>Cliente:</span>
                <span className="truncate ml-2">{sale.customer_name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Pago:</span>
              <span className="uppercase">{sale.payment_method}</span>
            </div>
          </div>

          {/* Productos */}
          <div className="border-t border-b border-dashed py-2 mb-2">
            <div className="space-y-1.5">
              {sale.items?.map((item, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="truncate mr-2">{item.product_name}</span>
                    <span>{item.subtotal.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-xs">
                    <span>{item.quantity} x {item.price.toFixed(2)}€</span>
                    <span>IVA {item.iva_rate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div className="space-y-0.5 text-xs mb-2">
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
            <div className="flex justify-between text-base font-bold pt-1 border-t">
              <span>TOTAL:</span>
              <span>{sale.total?.toFixed(2)}€</span>
            </div>
          </div>

          {/* Desglose IVA */}
          <div className="border-t border-dashed pt-2 mb-2 text-xs">
            <p className="font-bold mb-1">Desglose IVA:</p>
            <div className="space-y-0.5 text-xs">
              {(() => {
                const ivaBreakdown = {};
                sale.items?.forEach(item => {
                  if (!ivaBreakdown[item.iva_rate]) {
                    ivaBreakdown[item.iva_rate] = { base: 0, iva: 0 };
                  }
                  const itemBase = item.subtotal / (1 + sale.discount / 100);
                  const itemIva = itemBase * item.iva_rate / 100;
                  ivaBreakdown[item.iva_rate].base += itemBase;
                  ivaBreakdown[item.iva_rate].iva += itemIva;
                });
                
                return Object.entries(ivaBreakdown).map(([rate, values]) => (
                  <div key={rate} className="flex justify-between">
                    <span>IVA {rate}%:</span>
                    <span>{values.base.toFixed(2)}€ + {values.iva.toFixed(2)}€</span>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Pie */}
          <div className="text-center text-xs border-t border-dashed pt-2">
            <p className="mb-1 font-semibold">¡Gracias por su compra!</p>
            <p className="text-xs text-slate-500">
              Ticket válido como comprobante
            </p>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-2 p-4 pt-0 print:hidden">
          <Button onClick={handlePrint} className="flex-1 bg-blue-600 hover:bg-blue-700 h-9 text-sm">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1 h-9 text-sm">
            <X className="w-4 h-4 mr-2" />
            Cerrar
          </Button>
        </div>

        {/* Estilos de impresión */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print\\:hidden {
              display: none !important;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}