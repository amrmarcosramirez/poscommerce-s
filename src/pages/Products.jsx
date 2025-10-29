
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
import { Package, Plus, Search, Edit, Trash2, AlertTriangle, Upload, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["Electrónica", "Ropa", "Alimentos", "Hogar", "Belleza", "Deportes", "Juguetes", "Libros", "Otros"];
const IVA_RATES = [0, 4, 10, 21];

export default function Products() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [storeFilter, setStoreFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all"); // New state variable
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    category: "Otros",
    price: 0,
    cost: 0,
    iva_rate: 21,
    stock: 0,
    min_stock: 5,
    barcode: "",
    image_url: "",
    store_id: "",
    show_in_ecommerce: false,
    is_active: true,
    has_variants: false,
    variants: []
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-created_date'),
  });

  const { data: stores = [] } = useQuery({
    queryKey: ['stores'],
    queryFn: () => base44.entities.Store.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success("Producto creado exitosamente");
    },
    onError: (error) => {
      toast.error(`Error al crear el producto: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success("Producto actualizado exitosamente");
    },
    onError: (error) => {
      toast.error(`Error al actualizar el producto: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Producto eliminado");
    },
    onError: (error) => {
      toast.error(`Error al eliminar el producto: ${error.message}`);
    }
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
          stock: 0,
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
      newVariants[index].attributes = {
        ...newVariants[index].attributes,
        [attrField]: value
      };
    } else {
      newVariants[index][field] = value;
    }
    setFormData({ ...formData, variants: newVariants });
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStore = storeFilter === "all" || p.store_id === storeFilter || !p.store_id;
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter; // New filter logic
    
    return matchesSearch && matchesStore && matchesCategory; // Apply new filter
  });

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      description: "",
      category: "Otros",
      price: 0,
      cost: 0,
      iva_rate: 21,
      stock: 0,
      min_stock: 5,
      barcode: "",
      image_url: "",
      store_id: "",
      show_in_ecommerce: false,
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
      variants: product.variants || []
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Si tiene variantes, sumar el stock total
    const totalStock = formData.has_variants 
      ? formData.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
      : formData.stock;

    const dataToSubmit = {
      ...formData,
      stock: totalStock,
      // Ensure variants array is empty if has_variants is false
      variants: formData.has_variants ? formData.variants : []
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
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
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
                    <Label htmlFor="category">Categoría</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store_id">Tienda</Label>
                    <Select value={formData.store_id || ""} onValueChange={(value) => setFormData({...formData, store_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las tiendas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>Todas las tiendas</SelectItem>
                        {stores.map(store => (
                          <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
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

                  {!formData.has_variants && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="stock">Stock</Label>
                        <Input
                          id="stock"
                          type="number"
                          min="0"
                          value={formData.stock}
                          onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                        />
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
                    </>
                  )}

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.show_in_ecommerce}
                        onChange={(e) => setFormData({...formData, show_in_ecommerce: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      🌐 Mostrar en eCommerce
                    </Label>
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

                {/* Variantes */}
                {formData.has_variants && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg">Variantes del Producto</h3>
                      <Button type="button" onClick={addVariant} variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Añadir Variante
                      </Button>
                    </div>
                    
                    {formData.variants.map((variant, index) => (
                      <Card key={index} className="p-4 bg-slate-50 relative">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium">Variante {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeVariant(index)}
                            className="absolute top-2 right-2"
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>

                        <div className="space-y-2 mb-4">
                          <Label>Imagen de la Variante</Label>
                          <div className="flex items-center gap-4">
                            {variant.image_url ? (
                              <div className="relative">
                                <img 
                                  src={variant.image_url} 
                                  alt={`Variante ${index + 1}`} 
                                  className="w-24 h-24 object-cover rounded-lg border"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateVariant(index, 'image_url', "")}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-white">
                                <ImageIcon className="w-6 h-6 text-slate-400" />
                              </div>
                            )}
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, true, index)}
                                className="hidden"
                                id={`image-upload-variant-${index}`}
                              />
                              <label htmlFor={`image-upload-variant-${index}`}>
                                <Button
                                  type="button"
                                  variant="outline"
                                  disabled={uploadingImage}
                                  className="cursor-pointer text-sm"
                                >
                                  <Upload className="w-4 h-4 mr-2" />
                                  {uploadingImage ? "Subiendo..." : "Subir Imagen"}
                                </Button>
                              </label>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-3">
                          <div className="space-y-2">
                            <Label>Color</Label>
                            <Input
                              value={variant.attributes.color}
                              onChange={(e) => updateVariant(index, 'attributes.color', e.target.value)}
                              placeholder="Azul"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Talla</Label>
                            <Input
                              value={variant.attributes.talla}
                              onChange={(e) => updateVariant(index, 'attributes.talla', e.target.value)}
                              placeholder="M"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>SKU Variante</Label>
                            <Input
                              value={variant.sku_variant}
                              onChange={(e) => updateVariant(index, 'sku_variant', e.target.value)}
                              placeholder="SKU-001-AZUL-M"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Stock</Label>
                            <Input
                              type="number"
                              min="0"
                              value={variant.stock}
                              onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Ajuste Precio (€)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={variant.price_adjustment}
                              onChange={(e) => updateVariant(index, 'price_adjustment', parseFloat(e.target.value) || 0)}
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Código Barras</Label>
                            <Input
                              value={variant.barcode}
                              onChange={(e) => updateVariant(index, 'barcode', e.target.value)}
                            />
                          </div>
                        </div>
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
            <div className="mb-4 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Buscar productos por nombre, SKU o categoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={storeFilter} onValueChange={setStoreFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Tienda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🏪 Todas las tiendas</SelectItem>
                  {stores.map(store => (
                    <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* New Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🏷️ Todas las categorías</SelectItem>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Tienda</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>eCommerce</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const store = stores.find(s => s.id === product.store_id);
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
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {store ? store.name : "Todas"}
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
                            {product.stock <= product.min_stock && (
                              <AlertTriangle className="w-4 h-4 text-orange-500" />
                            )}
                            <span className={product.stock <= product.min_stock ? "text-orange-600 font-semibold" : ""}>
                              {product.stock}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.is_active ? "default" : "secondary"}>
                            {product.is_active ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {product.show_in_ecommerce ? "✅" : "❌"}
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
