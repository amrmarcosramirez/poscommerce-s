import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from 'lucide-react';

export default function TopProducts({ sales, products }) {
  const productSales = React.useMemo(() => {
    const salesMap = {};
    
    sales.forEach(sale => {
      sale.items?.forEach(item => {
        if (!salesMap[item.product_id]) {
          salesMap[item.product_id] = {
            id: item.product_id,
            name: item.product_name,
            quantity: 0,
            revenue: 0
          };
        }
        salesMap[item.product_id].quantity += item.quantity;
        salesMap[item.product_id].revenue += item.subtotal;
      });
    });
    
    return Object.values(salesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [sales]);

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Top Productos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {productSales.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No hay datos disponibles</p>
          ) : (
            productSales.map((product, index) => (
              <div key={product.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                  index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white' :
                  index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{product.name}</p>
                  <p className="text-sm text-slate-600">
                    {product.quantity} unidades vendidas
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-700">{product.revenue.toFixed(2)}€</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}