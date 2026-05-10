import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../lib/AuthContext';
import { collections, subscribeToProducts, subscribeToMaterials, subscribeToOrders, createDocument, updateDocument, deleteDocument, fetchStoreProfile, saveStoreProfile } from '../services/db';
import { format, parseISO } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Store, Link as LinkIcon, Copy, Settings, Package, ShoppingBag, PieChart } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { user, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'products' | 'materials' | 'orders' | 'reports'>('profile');

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <h1 className="font-serif text-4xl mb-6">Aroma PRO Admin</h1>
        <button onClick={login} className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium">
          Entrar con Google
        </button>
      </div>
    );
  }

  // Calculate the store URL
  const storeUrl = `${window.location.origin}/#/store/${user.uid}`;

  const copyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    toast.success("Enlace copiado al portapapeles");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r border-border p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <Store className="text-primary" />
          <h2 className="font-serif text-2xl">Mi Tienda</h2>
        </div>
        
        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible flex-grow">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`text-left px-4 py-3 rounded-md transition-colors flex items-center justify-center md:justify-start gap-3 ${activeTab === 'profile' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted text-muted-foreground'}`}
          >
            <Settings size={18} /> <span className="hidden md:inline">Configuración</span>
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`text-left px-4 py-3 rounded-md transition-colors flex items-center justify-center md:justify-start gap-3 ${activeTab === 'products' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted text-muted-foreground'}`}
          >
            <ShoppingBag size={18} /> <span className="hidden md:inline">Catálogo</span>
          </button>
          <button 
            onClick={() => setActiveTab('materials')}
            className={`text-left px-4 py-3 rounded-md transition-colors flex items-center justify-center md:justify-start gap-3 ${activeTab === 'materials' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted text-muted-foreground'}`}
          >
            <Package size={18} /> <span className="hidden md:inline">Inventario</span>
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`text-left px-4 py-3 rounded-md transition-colors flex items-center justify-center md:justify-start gap-3 ${activeTab === 'orders' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted text-muted-foreground'}`}
          >
            <Store size={18} /> <span className="hidden md:inline">Pedidos</span>
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`text-left px-4 py-3 rounded-md transition-colors flex items-center justify-center md:justify-start gap-3 ${activeTab === 'reports' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted text-muted-foreground'}`}
          >
            <PieChart size={18} /> <span className="hidden md:inline">Reportes</span>
          </button>
        </nav>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Enlace Público de tu catálogo:</p>
          <div className="flex items-center gap-2 bg-muted p-2 rounded text-sm overflow-hidden text-ellipsis mb-4 hover:bg-accent cursor-pointer transition-colors" onClick={copyLink}>
            <LinkIcon size={14} className="shrink-0" />
            <span className="truncate">{storeUrl}</span>
            <Copy size={14} className="shrink-0 text-primary ml-auto" />
          </div>

          <button onClick={logout} className="text-sm text-red-500 hover:underline w-full text-left">
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {activeTab === 'profile' && <ProfileTab storeId={user.uid} />}
        {activeTab === 'products' && <ProductsTab storeId={user.uid} />}
        {activeTab === 'materials' && <MaterialsTab storeId={user.uid} />}
        {activeTab === 'orders' && <OrdersTab storeId={user.uid} />}
        {activeTab === 'reports' && <ReportsTab storeId={user.uid} />}
      </main>
    </div>
  );
}

function ProfileTab({ storeId }: { storeId: string }) {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    storeName: '',
    phone: '',
    description: ''
  });

  useEffect(() => {
    fetchStoreProfile(storeId).then(data => {
      if (data) {
        setFormData({
          storeName: data.storeName || '',
          phone: data.phone || '',
          description: data.description || ''
        });
      }
      setLoading(false);
    });
  }, [storeId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveStoreProfile(storeId, formData);
      toast.success("Configuración guardada correctamente");
    } catch (e) {
      toast.error("Error al guardar");
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="max-w-2xl">
      <h3 className="text-2xl font-serif mb-6">Configuración de la Tienda</h3>
      <p className="text-muted-foreground mb-8">Personaliza cómo los clientes ven tu catálogo y dónde recibes los pedidos.</p>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Nombre de la Marca</label>
          <input 
            required 
            placeholder="Ej: Velas Mágicas de Ana" 
            className="w-full border p-3 rounded-md"
            value={formData.storeName}
            onChange={e => setFormData({...formData, storeName: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Número de WhatsApp (con código de país)</label>
          <input 
            required 
            placeholder="Ej: +5491112345678" 
            className="w-full border p-3 rounded-md font-mono"
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
          />
          <p className="text-xs text-muted-foreground mt-2">Los pedidos del catálogo se enviarán a este número.</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Descripción (Opcional)</label>
          <textarea 
            placeholder="Una breve descripción para tus clientes..." 
            className="w-full border p-3 rounded-md"
            rows={3}
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <button type="submit" className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors">
          Guardar Cambios
        </button>
      </form>
    </div>
  );
}

function ProductsTab({ storeId }: { storeId: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '0', category: 'sachet', isActive: true, description: '' });

  useEffect(() => {
    return subscribeToProducts(storeId, setProducts);
  }, [storeId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createDocument(collections.PRODUCTS, Date.now().toString(), {
      ...formData,
      storeId,
      price: parseFloat(formData.price),
    });
    setIsAdding(false);
    toast.success("Producto creado");
  };

  const handleDelete = async (id: string) => {
    if(confirm('¿Eliminar producto?')) {
      await deleteDocument(collections.PRODUCTS, id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-serif">Catálogo de Productos</h3>
        <button onClick={() => setIsAdding(!isAdding)} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm">
          {isAdding ? 'Cancelar' : '+ Nuevo Producto'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="bg-card p-6 rounded-md shadow-sm mb-8 border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Nombre del producto</label>
              <input required className="border p-2 rounded w-full" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Precio ($)</label>
              <input required type="number" step="0.01" className="border p-2 rounded w-full" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Categoría</label>
              <select className="border p-2 rounded w-full bg-background" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="sachet">Sachet</option>
                <option value="melt">Melt</option>
                <option value="squeeze">Squeeze</option>
              </select>
            </div>
            <div className="flex items-center mt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4" />
                Mostrar en la tienda pública
              </label>
            </div>
          </div>
          <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded">Guardar</button>
        </form>
      )}

      {products.length === 0 && !isAdding && (
         <div className="text-center bg-card p-12 rounded border border-dashed border-border py-20">
           <p className="text-muted-foreground font-serif text-lg mb-4">Tu catálogo está vacío.</p>
           <button onClick={() => setIsAdding(true)} className="text-primary hover:underline">Sube tu primer producto</button>
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {products.map(p => (
          <div key={p.id} className="bg-card p-5 rounded-md shadow-sm border border-border group">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold">{p.name}</h4>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full ${p.isActive ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}`}>
                {p.isActive ? 'Visible' : 'Oculto'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground capitalize">{p.category}</p>
            <p className="mt-4 text-lg font-serif">${p.price}</p>
            <div className="mt-4 pt-4 border-t border-muted text-right opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleDelete(p.id)} className="text-red-500 text-sm hover:underline">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MaterialsTab({ storeId }: { storeId: string }) {
  const [materials, setMaterials] = useState<any[]>([]);
  const [formData, setFormData] = useState({ name: '', quantity: '0', unit: 'g' });

  useEffect(() => {
    return subscribeToMaterials(storeId, setMaterials);
  }, [storeId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createDocument(collections.MATERIALS, Date.now().toString(), {
      name: formData.name,
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      storeId
    });
    setFormData({ name: '', quantity: '0', unit: 'g' });
  };

  const handleDelete = async (id: string) => {
    await deleteDocument(collections.MATERIALS, id);
  };

  return (
    <div>
      <h3 className="text-2xl font-serif mb-6">Stock de Materiales</h3>
      
      <form onSubmit={handleCreate} className="flex flex-wrap lg:flex-nowrap gap-4 mb-8 bg-card p-6 rounded-md shadow-sm border border-border items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-muted-foreground block mb-1">Nombre (ej. Cera de Soja, Mechas)</label>
          <input required placeholder="Material" className="w-full border border-input p-2 rounded bg-background" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div className="w-full lg:w-32">
          <label className="text-xs font-medium text-muted-foreground block mb-1">Cantidad</label>
          <input required type="number" step="any" className="w-full border border-input p-2 rounded bg-background" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
        </div>
        <div className="w-full lg:w-24">
          <label className="text-xs font-medium text-muted-foreground block mb-1">Unidad</label>
          <input required placeholder="g, ml, un" className="w-full border border-input p-2 rounded bg-background" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
        </div>
        <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded h-[42px] font-medium w-full lg:w-auto">Agregar</button>
      </form>

      <div className="bg-card rounded-md shadow-sm border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-muted text-muted-foreground text-sm">
            <tr>
              <th className="p-4 font-normal">Material</th>
              <th className="p-4 font-normal">Stock Actual</th>
              <th className="p-4 font-normal text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-muted">
            {materials.map(m => (
              <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                <td className="p-4 font-medium">{m.name}</td>
                <td className="p-4 font-mono text-sm">{m.quantity} <span className="text-muted-foreground">{m.unit}</span></td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(m.id)} className="text-red-500 text-sm hover:underline">Borrar</button>
                </td>
              </tr>
            ))}
            {materials.length === 0 && (
              <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">Tu inventario está vacío.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrdersTab({ storeId }: { storeId: string }) {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    return subscribeToOrders(storeId, setOrders);
  }, [storeId]);

  const updateStatus = async (id: string, status: string) => {
    await updateDocument(collections.ORDERS, id, { status });
  };

  return (
    <div>
      <h3 className="text-2xl font-serif mb-6">Órdenes (Pedidos web)</h3>
      <div className="grid grid-cols-1 gap-4">
        {orders.map(o => (
          <div key={o.id} className="bg-card p-6 rounded-md shadow-sm border border-border flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div className="flex-1 w-full">
              <div className="flex justify-between items-start mb-4 md:mb-2">
                <p className="font-semibold text-lg">{o.customerName} <span className="font-normal text-sm font-mono text-muted-foreground ml-2">{o.customerPhone}</span></p>
                <span className="text-xs text-muted-foreground md:hidden mt-1">
                  {new Date(o.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="bg-muted/50 p-3 rounded text-sm space-y-1 mb-4">
                {o.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between">
                    <span>{item.quantity}x {item.name}</span>
                    <span className="text-muted-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <p className="font-serif text-lg text-primary">Total: ${o.total.toFixed(2)}</p>
            </div>
            
            <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-2 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-border">
              <span className="text-xs text-muted-foreground hidden md:block">
                {new Date(o.createdAt).toLocaleString()}
              </span>
              <select 
                className={`border p-2 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 w-full md:w-auto
                  ${o.status === 'pending' ? 'bg-amber-50 text-amber-900 border-amber-200' : 
                    o.status === 'completed' ? 'bg-green-50 text-green-900 border-green-200' : 
                    'bg-slate-50 text-slate-900 border-slate-200'}`}
                value={o.status}
                onChange={e => updateStatus(o.id, e.target.value)}
              >
                <option value="pending">Pendiente</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
           <div className="text-center bg-card p-12 rounded border border-dashed border-border py-20">
             <p className="text-muted-foreground font-serif text-lg">Aún no tienes pedidos.</p>
             <p className="text-sm mt-2 text-muted-foreground">Comparte tu enlace para recibir los primeros pedidos.</p>
           </div>
        )}
      </div>
    </div>
  );
}

function ReportsTab({ storeId }: { storeId: string }) {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    return subscribeToOrders(storeId, setOrders);
  }, [storeId]);

  const chartData = useMemo(() => {
    // Only count completed orders
    const completedOrders = orders.filter(o => o.status === 'completed');
    
    // Group by month
    const monthlyData: Record<string, number> = {};
    
    completedOrders.forEach(o => {
      if (o.createdAt) {
        const month = format(parseISO(o.createdAt), 'MMM yyyy');
        if (!monthlyData[month]) {
          monthlyData[month] = 0;
        }
        monthlyData[month] += o.total;
      }
    });

    return Object.keys(monthlyData).map(month => ({
      name: month,
      Ventas: monthlyData[month]
    })).reverse(); // Oldest to newest
  }, [orders]);

  const totalRevenue = chartData.reduce((acc, curr) => acc + curr.Ventas, 0);

  return (
    <div className="max-w-5xl">
      <h3 className="text-2xl font-serif mb-6">Reportes Mensuales</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-card p-8 rounded-md shadow-sm border border-border">
          <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2 font-medium">Ingresos Totales (Completados)</p>
          <p className="text-5xl font-serif text-primary">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-card p-8 rounded-md shadow-sm border border-border">
          <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2 font-medium">Órdenes Atendidas</p>
          <p className="text-5xl font-serif text-primary">{orders.filter(o => o.status === 'completed').length}</p>
        </div>
      </div>
      
      <div className="bg-card p-8 rounded-md shadow-sm border border-border">
        <h4 className="font-semibold mb-8 text-lg">Evolución de Ventas</h4>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{fontSize: 12, fill: '#666'}} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize: 12, fill: '#666'}} axisLine={false} tickLine={false} tickFormatter={(val: number) => `$${val}`} />
              <Tooltip cursor={{fill: '#f5f5f0'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
              <Bar dataKey="Ventas" fill="#5A5A40" radius={[6, 6, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
