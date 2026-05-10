import React, { useEffect, useState } from 'react';
import { ShoppingBag, Search } from 'lucide-react';
import { fetchActiveProducts, createDocument, collections } from '../services/db';
import { useCartStore } from '../store/useCartStore';

export default function PublicCatalog() {
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState<string>('all');
  const cart = useCartStore();

  useEffect(() => {
    fetchActiveProducts().then(setProducts);
  }, []);

  const filteredProducts = category === 'all' 
    ? products 
    : products.filter(p => p.category === category);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-24">
      {/* Header */}
      <header className="pt-16 pb-12 px-6 text-center space-y-4">
        <h1 className="font-serif text-5xl md:text-6xl text-primary">Aroma PRO</h1>
        <p className="text-muted-foreground font-serif text-xl italic max-w-md mx-auto">
          Artesanía en cera aromática. Eleva tus sentidos.
        </p>
      </header>

      {/* Category Pills */}
      <div className="flex overflow-x-auto px-6 mb-8 gap-3 no-scrollbar justify-center">
        {['all', 'sachet', 'melt', 'squeeze'].map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              category === cat 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            {cat === 'all' ? 'Todos' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="px-6 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-card rounded-md shadow-sm overflow-hidden flex flex-col items-center p-4">
            <div className="w-48 h-48 rounded-full overflow-hidden mb-6 bg-muted">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground font-serif italic">
                  Sin imagen
                </div>
              )}
            </div>
            <h3 className="font-serif text-xl mb-2 text-center">{product.name}</h3>
            <p className="text-primary font-medium mb-4">${product.price.toFixed(2)}</p>
            <button 
              onClick={() => cart.addItem(product)}
              className="w-full py-3 rounded-full border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Agregar al carrito
            </button>
          </div>
        ))}
      </div>

      {cart.items.length > 0 && <CartFab />}
    </div>
  );
}

function CartFab() {
  const cart = useCartStore();
  const [isOpen, setIsOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleWhatsAppCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) return;
    
    setIsCheckingOut(true);
    const orderId = Math.random().toString(36).substring(2, 9);
    const adminPhone = "1234567890"; // In a real app, this should be configurable
    
    const orderData = {
      customerName,
      customerPhone,
      items: cart.items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price, id: i.id })),
      total: cart.total(),
      status: 'pending',
    };

    try {
      await createDocument(collections.ORDERS, orderId, orderData);
      
      let msg = `¡Hola! Me gustaría hacer un pedido (Ref: ${orderId}):\n\n`;
      msg += `Nombre: ${customerName}\n`;
      msg += `Teléfono: ${customerPhone}\n\n`;
      cart.items.forEach(item => {
        msg += `- ${item.quantity}x ${item.name} ($${item.price})\n`;
      });
      msg += `\nTotal: $${cart.total().toFixed(2)}\n\nPor favor confirmen mi pedido.`;
      
      window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`, '_blank');
      
      cart.clearCart();
      setIsOpen(false);
    } catch(e) {
      console.error(e);
      alert('Hubo un error al procesar el pedido. Intentá de nuevo.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-primary text-primary-foreground p-4 rounded-full shadow-lg flex items-center gap-2 z-50 hover:opacity-90 transition-opacity"
      >
        <ShoppingBag size={24} />
        <span className="font-bold">{cart.items.length}</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-md p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-serif text-2xl">Tu Carrito</h2>
          <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
            Cerrar
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {cart.items.map(item => (
            <div key={item.id} className="flex justify-between items-center bg-muted/30 p-3 rounded-sm">
              <div>
                <p className="font-medium">{item.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <button onClick={() => cart.updateQuantity(item.id, item.quantity - 1)} className="text-muted-foreground">-</button>
                  <span className="text-sm">{item.quantity}</span>
                  <button onClick={() => cart.updateQuantity(item.id, item.quantity + 1)} className="text-muted-foreground">+</button>
                </div>
              </div>
              <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center font-serif text-xl mb-8 border-t border-muted pt-4">
          <span>Total</span>
          <span className="text-primary">${cart.total().toFixed(2)}</span>
        </div>

        <form onSubmit={handleWhatsAppCheckout} className="space-y-4">
          <input 
            required 
            placeholder="Tu Nombre" 
            className="w-full border p-3 rounded-md bg-background" 
            value={customerName} 
            onChange={e => setCustomerName(e.target.value)} 
          />
          <input 
            required 
            placeholder="Tu Teléfono (e.g. 11-1234-5678)" 
            className="w-full border p-3 rounded-md bg-background" 
            value={customerPhone} 
            onChange={e => setCustomerPhone(e.target.value)} 
          />
          <button 
            type="submit"
            disabled={isCheckingOut}
            className="w-full bg-[#25D366] text-white py-4 rounded-full font-medium hover:bg-[#128C7E] transition-colors disabled:opacity-50"
          >
            {isCheckingOut ? 'Procesando...' : 'Pedir por WhatsApp'}
          </button>
        </form>
      </div>
    </div>
  );
}
