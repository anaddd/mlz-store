import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Loader2, ShoppingBag, Package } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function AdminProducts() {
  const products = trpc.products.listAll.useQuery();
  const categories = trpc.categories.list.useQuery();
  const createProduct = trpc.products.create.useMutation();
  const updateProduct = trpc.products.update.useMutation();
  const deleteProduct = trpc.products.delete.useMutation();
  const createCategory = trpc.categories.create.useMutation();
  const utils = trpc.useUtils();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", price: "", comparePrice: "", imageUrl: "", categoryId: "", stock: "10", isActive: true, isFeatured: false });
  const [catForm, setCatForm] = useState({ name: "", slug: "", description: "" });

  const resetForm = () => {
    setForm({ name: "", slug: "", description: "", price: "", comparePrice: "", imageUrl: "", categoryId: "", stock: "10", isActive: true, isFeatured: false });
    setEditingId(null);
  };

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      name: p.name, slug: p.slug, description: p.description || "", price: p.price,
      comparePrice: p.comparePrice || "", imageUrl: p.imageUrl || "",
      categoryId: p.categoryId ? String(p.categoryId) : "", stock: String(p.stock),
      isActive: p.isActive, isFeatured: p.isFeatured,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const data = {
        name: form.name, slug: form.slug || slugify(form.name), description: form.description || undefined,
        price: form.price, comparePrice: form.comparePrice || undefined, imageUrl: form.imageUrl || undefined,
        categoryId: form.categoryId ? parseInt(form.categoryId) : undefined, stock: parseInt(form.stock) || 0,
        isActive: form.isActive, isFeatured: form.isFeatured,
      };
      if (editingId) {
        await updateProduct.mutateAsync({ id: editingId, ...data });
        toast.success("Product updated");
      } else {
        await createProduct.mutateAsync(data);
        toast.success("Product created");
      }
      utils.products.listAll.invalidate();
      setDialogOpen(false);
      resetForm();
    } catch (e: any) {
      toast.error(e.message || "Failed to save product");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct.mutateAsync({ id });
      utils.products.listAll.invalidate();
      toast.success("Product deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const handleCreateCategory = async () => {
    try {
      await createCategory.mutateAsync({ name: catForm.name, slug: catForm.slug || slugify(catForm.name), description: catForm.description || undefined });
      utils.categories.list.invalidate();
      setCatDialogOpen(false);
      setCatForm({ name: "", slug: "", description: "" });
      toast.success("Category created");
    } catch (e: any) { toast.error(e.message || "Failed"); }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Products</h1>
            <p className="text-sm text-muted-foreground">Manage your store products and categories</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-1" /> Category</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New Category</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div><Label>Name</Label><Input value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value, slug: slugify(e.target.value) })} className="mt-1" /></div>
                  <div><Label>Slug</Label><Input value={catForm.slug} onChange={e => setCatForm({ ...catForm, slug: e.target.value })} className="mt-1" /></div>
                  <div><Label>Description</Label><Textarea value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} className="mt-1" rows={2} /></div>
                  <Button className="w-full bg-primary" onClick={handleCreateCategory} disabled={createCategory.isPending}>Create Category</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary hover:bg-primary/80"><Plus className="w-4 h-4 mr-1" /> Product</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{editingId ? "Edit Product" : "New Product"}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: editingId ? form.slug : slugify(e.target.value) })} className="mt-1" /></div>
                  <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="mt-1" /></div>
                  <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1" rows={3} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Price ($)</Label><Input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="mt-1" /></div>
                    <div><Label>Compare Price ($)</Label><Input type="number" step="0.01" value={form.comparePrice} onChange={e => setForm({ ...form, comparePrice: e.target.value })} className="mt-1" /></div>
                  </div>
                  <div><Label>Image URL</Label><Input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} className="mt-1" placeholder="https://..." /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Category</Label>
                      <Select value={form.categoryId} onValueChange={v => setForm({ ...form, categoryId: v })}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {categories.data?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="mt-1" /></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Active</Label><Switch checked={form.isActive} onCheckedChange={v => setForm({ ...form, isActive: v })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Featured</Label><Switch checked={form.isFeatured} onCheckedChange={v => setForm({ ...form, isFeatured: v })} />
                  </div>
                  <Button className="w-full bg-primary" onClick={handleSubmit} disabled={createProduct.isPending || updateProduct.isPending}>
                    {(createProduct.isPending || updateProduct.isPending) ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {editingId ? "Update Product" : "Create Product"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {products.isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : products.data && products.data.length > 0 ? (
          <div className="grid gap-4">
            {products.data.map((p) => (
              <Card key={p.id} className="bg-card/50 border-border/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-muted/30 rounded-md overflow-hidden flex-shrink-0">
                    {p.imageUrl ? <img src={p.imageUrl} alt="" className="w-full h-full object-cover" /> :
                      <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-6 h-6 text-muted-foreground/30" /></div>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{p.name}</h3>
                      {!p.isActive && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">Inactive</span>}
                      {p.isFeatured && <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">Featured</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">Stock: {p.stock} | Price: ${p.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(p)}><Pencil className="w-4 h-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(p.id)} className="bg-destructive">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Products Yet</h3>
            <p className="text-sm text-muted-foreground">Click "Product" to add your first product.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
