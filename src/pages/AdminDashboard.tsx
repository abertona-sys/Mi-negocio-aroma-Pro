import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../lib/AuthContext';
import { collections, subscribeToProducts, subscribeToMaterials, subscribeToOrders, createDocument, updateDocument, deleteDocument } from '../services/db';
import { format, parseISO } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { user, login, logout, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'materials' | 'orders' | 'reports'>('products');

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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <h1 className="font-serif text-4xl mb-6 text-red-700">Acceso Denegado</h1>
        <p className="mb-6">Esta cuenta no tiene permisos de administrador.</p>
        <button onClick={logout} className="border border-muted-foreground px-8 py-3 rounded-full font-medium bg-card">
          Cerrar Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r border-border p-6 flex flex-col">
        <h2 className="font-serif text-2xl mb-8">Admin Panel</h2>
        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible flex-grow">
          <button 
            onClick={() => setActiveTab('products')}
            className={`text-left px-4 py-2 rounded-md transition-colors ${activeTab === 'products' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
          >
            Productos
          </button>
          <button 
            onClick={() => setActiveTab('materials')}
            className={`text-left px-4 py-2 rounded-md transition-colors ${activeTab === 'materials' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
          >
            Materiales (Stock)
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`text-left px-4 py-2 rounded-md transition-colors ${activeTab === 'orders' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
          >
            Órdenes
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`text-left px-4 py-2 rounded-md transition-colors ${activeTab === 'reports' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
          >
            Reportes
          </button>
        </nav>
        <button onClick={logout} className="mt-8 text-sm text-muted-foreground hover:text-foreground text-left">
          Cerrar Sesión
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'materials' && <MaterialsTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'reports' && <ReportsTab />}
      </main>
    </div>
  );
}

function ProductsTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '0', category: 'sachet', isActive: true, description: '' });

  useEffect(() => {
    return subscribeToProducts(setProducts);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createDocument(collections.PRODUCTS, Date.now().toString(), {
      ...formData,
      price: parseFloat(formData.price),
    });
    setIsAdding(false);
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
        <form onSubmit={handleCreate} className="bg-card p-6 rounded-md shadow-sm mb-8 space-y-4 border border-border">
          <div className="grid grid-cols-2 gap-4">
            <input required placeholder="Nombre" className="border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input required type="number" step="0.01" placeholder="Precio" className="border p-2 rounded" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            <select className="border p-2 rounded" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option value="sachet">Sachet</option>
              <option value="melt">Melt</option>
              <option value="squeeze">Squeeze</option>
            </select>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
              Activo en tienda
            </label>
          </div>
          <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded">Guardar</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(p => (
          <div key={p.id} className="bg-card p-4 rounded-md shadow-sm border border-border">
            <h4 className="font-semibold">{p.name}</h4>
            <p className="text-sm text-muted-foreground capitalize">{p.category}</p>
            <p className="mt-2">${p.price}</p>
            <div className="flex gap-2 mt-4 pt-4 border-t border-muted">
              <span className={`text-xs px-2 py-1 rounded-full ${p.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {p.isActive ? 'Activo' : 'Oculto'}
              </span>
              <div className="flex-1" />
              <button onClick={() => handleDelete(p.id)} className="text-red-600 text-sm hover:underline">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MaterialsTab() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [formData, setFormData] = useState({ name: '', quantity: '0', unit: 'g' });

  useEffect(() => {
    return subscribeToMaterials(setMaterials);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createDocument(collections.MATERIALS, Date.now().toString(), {
      name: formData.name,
      quantity: parseFloat(formData.quantity),
      unit: formData.unit
    });
    setFormData({ name: '', quantity: '0', unit: 'g' });
  };

  const handleDelete = async (id: string) => {
    await deleteDocument(collections.MATERIALS, id);
  };

  return (
    <div>
      <h3 className="text-2xl font-serif mb-6">Stock de Materiales</h3>
      <form onSubmit={handleCreate} className="flex gap-4 mb-8 bg-card p-4 rounded-md shadow-sm border border-border items-end">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground block mb-1">Nombre (ej. Cera de Soja)</label>
          <input required placeholder="Material" className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div className="w-24">
          <label className="text-xs text-muted-foreground block mb-1">Cantidad</label>
          <input required type="number" className="w-full border p-2 rounded" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
        </div>
        <div className="w-20">
          <label className="text-xs text-muted-foreground block mb-1">Unidad</label>
          <input required placeholder="g, ml, un" className="w-full border p-2 rounded" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
        </div>
        <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded h-[42px]">+</button>
      </form>

      <div className="bg-card rounded-md shadow-sm border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-muted text-muted-foreground text-sm">
            <tr>
              <th className="p-4 font-normal">Material</th>
              <th className="p-4 font-normal">Stock Actual</th>
              <th className="p-4 font-normal">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-muted">
            {materials.map(m => (
              <tr key={m.id}>
                <td className="p-4">{m.name}</td>
                <td className="p-4 font-mono">{m.quantity} {m.unit}</td>
                <td className="p-4">
                  <button onClick={() => handleDelete(m.id)} className="text-red-500 text-sm">Borrar</button>
                </td>
              </tr>
            ))}
            {materials.length === 0 && (
              <tr><td colSpan={3} className="p-4 text-center text-muted-foreground">Sin inventario.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    return subscribeToOrders(setOrders);
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await updateDocument(collections.ORDERS, id, { status });
  };

  return (
    <div>
      <h3 className="text-2xl font-serif mb-6">Órdenes (WhatsApp)</h3>
      <div className="space-y-4">
        {orders.map(o => (
          <div key={o.id} className="bg-card p-4 rounded-md shadow-sm border border-border flex flex-col md:flex-row gap-4 justify-between">
            <div>
              <p className="font-semibold">{o.customerName} <span className="font-normal text-sm text-muted-foreground">({o.customerPhone})</span></p>
              <ul className="mt-2 text-sm space-y-1">
                {o.items?.map((item: any, i: number) => (
                  <li key={i}>• {item.quantity}x {item.name}</li>
                ))}
              </ul>
              <p className="mt-4 font-medium text-primary">Total: ${o.total}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <select 
                className="border p-2 rounded text-sm bg-background"
                value={o.status}
                onChange={e => updateStatus(o.id, e.target.value)}
              >
                <option value="pending">Pendiente</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
              </select>
              <span className="text-xs text-muted-foreground mt-auto">
                {new Date(o.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <p className="text-muted-foreground">No hay órdenes registradas.</p>
        )}
      </div>
    </div>
  );
}

function ReportsTab() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    return subscribeToOrders(setOrders);
  }, []);

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
    <div>
      <h3 className="text-2xl font-serif mb-6">Reportes Mensuales</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-card p-6 rounded-md shadow-sm border border-border">
          <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">Ingresos Totales (Completados)</p>
          <p className="text-4xl font-serif text-primary">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-card p-6 rounded-md shadow-sm border border-border">
          <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">Órdenes Atendidas</p>
          <p className="text-4xl font-serif text-primary">{orders.filter(o => o.status === 'completed').length}</p>
        </div>
      </div>
      
      <div className="bg-card p-6 rounded-md shadow-sm border border-border">
        <h4 className="font-semibold mb-6">Evolución de Ventas</h4>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{fontSize: 12, fill: '#666'}} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize: 12, fill: '#666'}} axisLine={false} tickLine={false} tickFormatter={(val: number) => `$${val}`} />
              <Tooltip cursor={{fill: '#f5f5f0'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
              <Bar dataKey="Ventas" fill="#5A5A40" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
