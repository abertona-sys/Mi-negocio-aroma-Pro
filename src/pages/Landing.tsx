import React from 'react';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export default function Landing() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const handleStart = async () => {
    if (user) {
      navigate('/admin');
    } else {
      await login();
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-2xl text-center space-y-8 z-10">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-medium text-sm mb-4">
          <ShoppingBag size={18} />
          <span>Para fabricantes de ceras aromáticas</span>
        </div>
        
        <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-foreground">
          Tu <span className="text-primary italic">catálogo virtual</span> en minutos.
        </h1>
        
        <p className="text-xl text-muted-foreground md:px-12 font-light">
          La herramienta definitiva para creadores de Aroma PRO. Sube tus productos, gestiona tu stock y recibe pedidos directo en tu WhatsApp.
        </p>

        <div className="pt-8">
          <button 
            onClick={handleStart}
            className="group inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-medium hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            {user ? 'Ir a mi Panel de Control' : 'Crear mi Catálogo Gratis'}
            <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="mt-12 text-sm text-muted-foreground">
          Una herramienta exclusiva para la comunidad de <span className="font-semibold">Aroma PRO</span>.
        </div>
      </div>
    </div>
  );
}
