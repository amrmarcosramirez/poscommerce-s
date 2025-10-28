import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Package, ArrowRight } from 'lucide-react';

export default function LowStockAlert({ products }) {
  return (
    <div className="space-y-2">
      {products.slice(0, 5).map((product) => (
        <div key={product.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Package className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">{product.name}</p>
              <p className="text-sm text-slate-600">
                Stock: <span className="font-semibold text-orange-600">{product.stock}</span> unidades
              </p>
            </div>
          </div>
          <Link to={createPageUrl("Products")}>
            <button className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center gap-1">
              Ver
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      ))}
      {products.length > 5 && (
        <p className="text-sm text-slate-600 text-center pt-2">
          Y {products.length - 5} productos más con stock bajo
        </p>
      )}
    </div>
  );
}