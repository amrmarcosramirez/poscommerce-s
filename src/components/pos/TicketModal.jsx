import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function TicketModal({ sale, store, onClose }) {
  const ticketRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  if (!sale) return null;

  return (
    <Dialog open={!!sale} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ticket de Venta</DialogTitle>
        </DialogHeader>

        {/* Ticket */}
        <div ref={ticketRef} className="bg-white p-6 font-mono text-sm print:p-8">
          {/* Encabezado */}
          <div className="text-center border-b-2 border-dashed pb-4 mb-4">
            <h1 className="text-xl font-bold mb-2">{store?.name || 'Mi Tienda'}</h1>
            {store?.address && <p className="text-xs">{store.address}</p>}
            {store?.city && <p className="text-xs">{store.city} - {store.postal_code}</p>}
            {store?.phone && <p className="text-xs">Tel: {store.phone}</p>}
            {store?.cif && <p className="text-xs">CIF: {store.cif}</p>}
          </div>

          {/* Información de la venta */}
          <div className="mb-4 text-xs space-y-1">
            <div className="flex justify-between">
              <span>Ticket:</span>
              <span className="font-bold">{sale.sale_number}</span>
            </div>
            <div className="flex justify-between">
              <span>Fecha:</span>
              <span>{format(new Date(sale.sale_date), "dd/MM/yyyy HH:mm", { locale: es })}</span>
            </div>
            {sale.customer_name && sale.customer_name !== "Cliente general" && (
              <>
                <div className="flex justify-between">
                  <span>Cliente:</span>
                  <span>{sale.customer_name}</span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span>Método pago:</span>
              <span className="uppercase">{sale.payment_method}</span>
            </div>
          </div>

          {/* Productos */}
          <div className="border-t-2 border-b-2 border-dashed py-3 mb-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-2">Producto</th>
                  <th className="text-center pb-2">Cant</th>
                  <th className="text-right pb-2">Precio</th>
                  <th className="text-right pb-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {sale.items?.map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2">
                      <div>{item.product_name}</div>
                      <div className="text-xs text-slate-500">IVA {item.iva_rate}%</div>
                    </td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-right">{item.price.toFixed(2)}€</td>
                    <td className="text-right font-semibold">{item.subtotal.toFixed(2)}€</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totales */}
          <div className="space-y-1 text-xs mb-4">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{sale.subtotal?.toFixed(2)}€</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Descuento ({sale.discount}%):</span>
                <span>-{((sale.subtotal * sale.discount) / 100).toFixed(2)}€</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>IVA:</span>
              <span>{sale.total_iva?.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t-2">
              <span>TOTAL:</span>
              <span>{sale.total?.toFixed(2)}€</span>
            </div>
          </div>

          {/* Desglose IVA */}
          <div className="border-t border-dashed pt-3 mb-4 text-xs">
            <p className="font-bold mb-2">Desglose IVA:</p>
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
                  <span>Base: {values.base.toFixed(2)}€ | IVA: {values.iva.toFixed(2)}€</span>
                </div>
              ));
            })()}
          </div>

          {/* Pie */}
          <div className="text-center text-xs border-t-2 border-dashed pt-4">
            <p className="mb-2">¡Gracias por su compra!</p>
            <p className="text-xs text-slate-500">
              Ticket válido como comprobante de compra
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Powered by POSCommerce
            </p>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 print:hidden">
          <Button onClick={handlePrint} className="flex-1 bg-blue-600 hover:bg-blue-700">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cerrar
          </Button>
        </div>

        {/* Estilos de impresión */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            ${ticketRef.current ? `
              .print\\:p-8,
              .print\\:p-8 * {
                visibility: visible;
              }
              .print\\:p-8 {
                position: absolute;
                left: 0;
                top: 0;
                width: 80mm;
              }
            ` : ''}
            .print\\:hidden {
              display: none !important;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}