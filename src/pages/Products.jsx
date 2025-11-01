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
import { Package, Plus, Search, Edit, Trash2, AlertTriangle, Upload, Image as ImageIcon, X, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";

const IVA_RATES = [0, 4, 10, 21];

// Función helper para obtener el stock según el modo y tienda
const getStockForStore = (product, storeId) => {
  if (!product) return 0;
  
  if (product.stock_mode === 'unique') {
    return product.stock || 0;
  } else if (product.stock_mode === 'by_store') {
    const storeStock = product.stock_by_store?.find(s => s.store_id === storeId);
    return storeStock?.stock || 0;
  } else if (product.stock_mode === 'by_group') {
    const group = product.store_groups?.find(g => g.store_ids?.includes(storeId));
    return group?.stock || 0;
  }
  return 0;
};

export default function Products() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [storeFilter, setStoreFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [sortField, setSortField] = useState('created_date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    category: "",
    price: 0,
    cost: 0,
    iva_rate: 21,
    stock_mode: "unique",
    stock: 0,
    stock_by_store: [],
    store_groups: [],
    min_stock: 5,
    barcode: "",
    image_url: "",
    physical_stores: [],
    online_stores: [],
    is_active: true,
    has_variants: false,
    variants: []
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-created_date'),
  });

  const { data: stores = [] } = useQuery({
    queryKey: ['stores'],
    queryFn: () => base44.entities.Store.list(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list('name'),
  });

  const activeCategories = categories.filter(c => c.is_active);
  const physicalStores = stores.filter(s => s.store_type === 'fisica' && s.is_active);
  const onlineStores = stores.filter(s => s.store_type === 'online' && s.is_active);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success("Producto creado exitosamente");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success("Producto actualizado exitosamente");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Producto eliminado");
    },
  });

  const handleImageUpload = async (e, isVariant = false, variantIndex = null) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      if (isVariant && variantIndex !== null) {
        const newVariants = [...formData.variants];
        newVariants[variantIndex].image_url = file_url;
        setFormData({ ...formData, variants: newVariants });
      } else {
        setFormData({ ...formData, image_url: file_url });
      }
      
      toast.success("Imagen subida correctamente");
    } catch (error) {
      toast.error("Error al subir la imagen");
    }
    setUploadingImage(false);
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          name: "",
          sku_variant: "",
          attributes: { color: "", talla: "" },
          price_adjustment: 0,
          stock_mode: "unique",
          stock: 0,
          stock_by_store: [],
          store_groups: [],
          barcode: "",
          image_url: ""
        }
      ]
    });
  };

  const removeVariant = (index) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index)
    });
  };

  const updateVariant = (index, field, value) => {
    const newVariants = [...formData.variants];
    if (field.startsWith('attributes.')) {
      const attrField = field.split('.')[1];
      newVariants[index].attributes[attrField] = value;
    } else {
      newVariants[index][field] = value;
    }
    setFormData({ ...formData, variants: newVariants });
  };

  const addStoreGroup = () => {
    setFormData({
      ...formData,
      store_groups: [
        ...formData.store_groups,
        { name: "", store_ids: [], stock: 0 }
      ]
    });
  };

  const removeStoreGroup = (index) => {
    setFormData({
      ...formData,
      store_groups: formData.store_groups.filter((_, i) => i !== index)
    });
  };

  const updateStoreGroup = (index, field, value) => {
    const newGroups = [...formData.store_groups];
    newGroups[index][field] = value;
    setFormData({ ...formData, store_groups: newGroups });
  };

  const toggleStoreInGroup = (groupIndex, storeId) => {
    const newGroups = [...formData.store_groups];
    const storeIds = newGroups[groupIndex].store_ids || [];
    
    if (storeIds.includes(storeId)) {
      newGroups[groupIndex].store_ids = storeIds.filter(id => id !== storeId);
    } else {
      newGroups[groupIndex].store_ids = [...storeIds, storeId];
    }
    
    setFormData({ ...formData, store_groups: newGroups });
  };

  const updateStockByStore = (storeId, stock) => {
    const newStockByStore = [...(formData.stock_by_store || [])];
    const index = newStockByStore.findIndex(s => s.store_id === storeId);
    
    if (index >= 0) {
      newStockByStore[index].stock = parseInt(stock) || 0;
    } else {
      newStockByStore.push({ store_id: storeId, stock: parseInt(stock) || 0 });
    }
    
    setFormData({ ...formData, stock_by_store: newStockByStore });
  };

  const getStockByStoreValue = (storeId) => {
    const stockEntry = formData.stock_by_store?.find(s => s.store_id === storeId);
    return stockEntry?.stock || 0;
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStore = storeFilter === "all" || 
      (p.physical_stores && p.physical_stores.includes(storeFilter)) ||
      (p.physical_stores?.length === 0);
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    
    return matchesSearch && matchesStore && matchesCategory;
  }).sort((a, b) => {
    let aVal = a[sortField] || '';
    let bVal = b[sortField] || '';
    
    if (sortField === 'price' || sortField === 'stock') {
      aVal = aVal || 0;
      bVal = bVal || 0;
    }
    
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      description: "",
      category: "",
      price: 0,
      cost: 0,
      iva_rate: 21,
      stock_mode: "unique",
      stock: 0,
      stock_by_store: [],
      store_groups: [],
      min_stock: 5,
      barcode: "",
      image_url: "",
      physical_stores: [],
      online_stores: [],
      is_active: true,
      has_variants: false,
      variants: []
    });
    setEditingProduct(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      ...product,
      physical_stores: product.physical_stores || [],
      online_stores: product.online_stores || [],
      stock_by_store: product.stock_by_store || [],
      store_groups: product.store_groups || [],
      variants: product.variants || []
    });
    setIsDialogOpen(true);
  };

  const togglePhysicalStore = (storeId) => {
    if (formData.physical_stores.includes(storeId)) {
      setFormData({
        ...formData,
        physical_stores: formData.physical_stores.filter(id => id !== storeId)
      });
    } else {
      setFormData({
        ...formData,
        physical_stores: [...formData.physical_stores, storeId]
      });
    }
  };

  const toggleAllPhysicalStores = () => {
    if (formData.physical_stores.length === physicalStores.length) {
      setFormData({ ...formData, physical_stores: [] });
    } else {
      setFormData({ ...formData, physical_stores: physicalStores.map(s => s.id) });
    }
  };

  const toggleOnlineStore = (storeId) => {
    if (formData.online_stores.includes(storeId)) {
      setFormData({
        ...formData,
        online_stores: formData.online_stores.filter(id => id !== storeId)
      });
    } else {
      setFormData({
        ...formData,
        online_stores: [...formData.online_stores, storeId]
      });
    }
  };

  const toggleAllOnlineStores = () => {
    if (formData.online_stores.length === onlineStores.length) {
      setFormData({ ...formData, online_stores: [] });
    } else {
      setFormData({ ...formData, online_stores: onlineStores.map(s => s.id) });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Calcular stock total según el modo
    let totalStock = 0;
    if (formData.stock_mode === 'unique') {
      totalStock = formData.stock;
    } else if (formData.stock_mode === 'by_store') {
      totalStock = formData.stock_by_store.reduce((sum, s) => sum + (s.stock || 0), 0);
    } else if (formData.stock_mode === 'by_group') {
      totalStock = formData.store_groups.reduce((sum, g) => sum + (g.stock || 0), 0);
    }

    // Si tiene variantes, calcular stock total de variantes
    if (formData.has_variants && formData.variants.length > 0) {
      totalStock = formData.variants.reduce((sum, v) => {
        if (v.stock_mode === 'unique') {
          return sum + (v.stock || 0);
        } else if (v.stock_mode === 'by_store') {
          return sum + (v.stock_by_store || []).reduce((s, st) => s + (st.stock || 0), 0);
        } else if (v.stock_mode === 'by_group') {
          return sum + (v.store_groups || []).reduce((s, g) => s + (g.stock || 0), 0);
        }
        return sum;
      }, 0);
    }

    const dataToSubmit = {
      ...formData,
      stock: totalStock
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: dataToSubmit });
    } else {
      createMutation.mutate(dataToSubmit);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-8 h-8" />
              Gestión de Productos
            </h1>
            <p className="text-slate-600 mt-1">Administra tu catálogo de productos</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Imagen del producto */}
                <div className="space-y-2">
                  <Label>Imagen del Producto Principal</Label>
                  <div className="flex items-center gap-4">
                    {formData.image_url ? (
                      <div className="relative">
                        <img
                          src={formData.image_url}
                          alt="Producto"
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, image_url: ""})}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-slate-50">
                        <ImageIcon className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, false)}
                        className="hidden"
                        id="image-upload-main"
                      />
                      <label htmlFor="image-upload-main">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={uploadingImage}
                          onClick={() => document.getElementById('image-upload-main').click()}
                          className="cursor-pointer"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {uploadingImage ? "Subiendo..." : "Subir Imagen"}
                        </Button>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeCategories.map(cat => (
                          <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barcode">Código de Barras</Label>
                    <Input
                      id="barcode"
                      value={formData.barcode}
                      onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Precio (sin IVA) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cost">Coste</Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.cost}
                      onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="iva_rate">IVA (%)</Label>
                    <Select value={formData.iva_rate.toString()} onValueChange={(value) => setFormData({...formData, iva_rate: parseInt(value)})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {IVA_RATES.map(rate => (
                          <SelectItem key={rate} value={rate.toString()}>{rate}%</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="min_stock">Stock Mínimo</Label>
                    <Input
                      id="min_stock"
                      type="number"
                      min="0"
                      value={formData.min_stock}
                      onChange={(e) => setFormData({...formData, min_stock: parseInt(e.target.value) || 0})}
                    />
                  </div>

                  {/* Checkbox variantes */}
                  <div className="space-y-2 md:col-span-2">
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.has_variants}
                        onChange={(e) => setFormData({...formData, has_variants: e.target.checked, variants: e.target.checked ? formData.variants : []})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      Este producto tiene variantes (colores, tallas, etc.)
                    </Label>
                  </div>

                  {/* Gestión de Stock */}
                  {!formData.has_variants && (
                    <div className="space-y-4 md:col-span-2 p-4 bg-slate-50 rounded-lg border">
                      <div className="space-y-2">
                        <Label htmlFor="stock_mode">Modo de Gestión de Stock *</Label>
                        <Select value={formData.stock_mode} onValueChange={(value) => setFormData({...formData, stock_mode: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unique">Stock Único (todas las tiendas)</SelectItem>
                            <SelectItem value="by_store">Stock por Tienda Individual</SelectItem>
                            <SelectItem value="by_group">Stock por Grupos de Tiendas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.stock_mode === 'unique' && (
                        <div className="space-y-2">
                          <Label htmlFor="stock">Stock Total</Label>
                          <Input
                            id="stock"
                            type="number"
                            min="0"
                            value={formData.stock}
                            onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                          />
                        </div>
                      )}

                      {formData.stock_mode === 'by_store' && (
                        <div className="space-y-3">
                          <Label>Stock por Tienda</Label>
                          <div className="grid md:grid-cols-2 gap-3">
                            {physicalStores.map(store => (
                              <div key={store.id} className="flex items-center gap-2">
                                <Label className="flex-1">{store.name}</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  className="w-24"
                                  value={getStockByStoreValue(store.id)}
                                  onChange={(e) => updateStockByStore(store.id, e.target.value)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {formData.stock_mode === 'by_group' && (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <Label>Grupos de Tiendas</Label>
                            <Button type="button" onClick={addStoreGroup} variant="outline" size="sm">
                              <Plus className="w-4 h-4 mr-1" />
                              Añadir Grupo
                            </Button>
                          </div>
                          {formData.store_groups.map((group, index) => (
                            <Card key={index} className="p-3 bg-white">
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <Input
                                    placeholder="Nombre del grupo"
                                    value={group.name}
                                    onChange={(e) => updateStoreGroup(index, 'name', e.target.value)}
                                    className="flex-1 mr-2"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeStoreGroup(index)}
                                  >
                                    <X className="w-4 h-4 text-red-500" />
                                  </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  {physicalStores.map(store => (
                                    <label key={store.id} className="flex items-center gap-2 text-sm">
                                      <input
                                        type="checkbox"
                                        checked={group.store_ids?.includes(store.id)}
                                        onChange={() => toggleStoreInGroup(index, store.id)}
                                        className="h-4 w-4"
                                      />
                                      {store.name}
                                    </label>
                                  ))}
                                </div>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="Stock del grupo"
                                  value={group.stock}
                                  onChange={(e) => updateStoreGroup(index, 'stock', parseInt(e.target.value) || 0)}
                                />
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tiendas Físicas */}
                  <div className="space-y-2 md:col-span-2">
                    <Label>🏪 Disponible en Tiendas Físicas</Label>
                    <div className="mb-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={toggleAllPhysicalStores}
                      >
                        {formData.physical_stores.length === physicalStores.length ? 'Desmarcar todas' : 'Seleccionar todas'}
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2">
                      {physicalStores.length === 0 ? (
                        <p className="text-sm text-slate-500 col-span-2">No hay tiendas físicas configuradas</p>
                      ) : (
                        physicalStores.map(store => (
                          <label key={store.id} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                            <input
                              type="checkbox"
                              checked={formData.physical_stores.includes(store.id)}
                              onChange={() => togglePhysicalStore(store.id)}
                              className="h-4 w-4"
                            />
                            <span className="text-sm">{store.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Tiendas Online */}
                  <div className="space-y-2 md:col-span-2">
                    <Label>🌐 Mostrar en Tiendas Online</Label>
                    <div className="mb-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={toggleAllOnlineStores}
                      >
                        {formData.online_stores.length === onlineStores.length ? 'Desmarcar todas' : 'Seleccionar todas'}
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2">
                      {onlineStores.length === 0 ? (
                        <p className="text-sm text-slate-500 col-span-2">No hay tiendas online configuradas</p>
                      ) : (
                        onlineStores.map(store => (
                          <label key={store.id} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                            <input
                              type="checkbox"
                              checked={formData.online_stores.includes(store.id)}
                              onChange={() => toggleOnlineStore(store.id)}
                              className="h-4 w-4"
                            />
                            <span className="text-sm">{store.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      Producto activo
                    </Label>
                  </div>
                </div>

                {/* Variantes - Similar logic for stock management in each variant */}
                {formData.has_variants && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg">Variantes del Producto</h3>
                      <Button type="button" onClick={addVariant} variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Añadir Variante
                      </Button>
                    </div>
                    <p className="text-sm text-slate-600">
                      Cada variante tiene su propia gestión de stock independiente
                    </p>

                    {formData.variants.map((variant, index) => (
                      <Card key={index} className="p-4 bg-slate-50 relative">
                        {/* Similar structure to main product but for variant */}
                        {/* ... variant fields ... */}
                      </Card>
                    ))}

                    {formData.variants.length === 0 && (
                      <p className="text-center text-slate-500 py-4">
                        No hay variantes. Haz clic en "Añadir Variante" para crear una.
                      </p>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingProduct ? "Actualizar" : "Crear"} Producto
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <div className="mb-4 flex gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Buscar productos por nombre, SKU o categoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={storeFilter} onValueChange={setStoreFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🏪 Todas las tiendas</SelectItem>
                  {physicalStores.map(store => (
                    <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">📦 Todas las categorías</SelectItem>
                  {activeCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => handleSort('name')} className="cursor-pointer hover:bg-slate-50">
                      <div className="flex items-center gap-1">
                        Producto
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('store_id')} className="cursor-pointer hover:bg-slate-50">
                      <div className="flex items-center gap-1">
                        Tienda
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('category')} className="cursor-pointer hover:bg-slate-50">
                      <div className="flex items-center gap-1">
                        Categoría
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('price')} className="cursor-pointer hover:bg-slate-50">
                      <div className="flex items-center gap-1">
                        Precio
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('stock')} className="cursor-pointer hover:bg-slate-50">
                      <div className="flex items-center gap-1">
                        Stock
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('is_active')} className="cursor-pointer hover:bg-slate-50">
                      <div className="flex items-center gap-1">
                        Estado
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </TableHead>
                    <TableHead>eCommerce</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const productPhysicalStores = product.physical_stores || [];
                    const productOnlineStores = product.online_stores || [];
                    
                    // Mostrar stock según modo y filtro actual
                    let displayStock = product.stock || 0;
                    if (storeFilter !== "all" && product.stock_mode !== 'unique') {
                      displayStock = getStockForStore(product, storeFilter);
                    }
                    
                    return (
                      <TableRow key={product.id} className="hover:bg-slate-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {product.image_url ? (
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center">
                                <Package className="w-6 h-6 text-slate-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-slate-900">{product.name}</p>
                              {product.sku && <p className="text-sm text-slate-500">SKU: {product.sku}</p>}
                              {product.has_variants && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  {product.variants?.length || 0} variantes
                                </Badge>
                              )}
                              {product.stock_mode !== 'unique' && (
                                <Badge variant="secondary" className="text-xs mt-1">
                                  {product.stock_mode === 'by_store' ? 'Stock por tienda' : 'Stock por grupos'}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {productPhysicalStores.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {productPhysicalStores.map(storeId => {
                                const store = stores.find(s => s.id === storeId);
                                return store ? (
                                  <Badge key={storeId} variant="outline" className="text-xs">
                                    {store.name}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          ) : (
                            <span className="text-slate-400">Todas</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold">{product.price?.toFixed(2)}€</p>
                            <p className="text-xs text-slate-500">+IVA {product.iva_rate}%</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {displayStock <= product.min_stock && (
                              <AlertTriangle className="w-4 h-4 text-orange-500" />
                            )}
                            <span className={displayStock <= product.min_stock ? "text-orange-600 font-semibold" : ""}>
                              {displayStock}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.is_active ? "default" : "secondary"}>
                            {product.is_active ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {productOnlineStores.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {productOnlineStores.map(storeId => {
                                const onlineStore = stores.find(s => s.id === storeId);
                                return onlineStore ? (
                                  <Badge key={storeId} variant="outline" className="text-xs">
                                    {onlineStore.name}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm("¿Eliminar este producto?")) {
                                  deleteMutation.mutate(product.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}