import MitoLogosApp from '@/components/MitoLogosApp';
import LogosGallery from '@/components/LogosGallery';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white selection:bg-indigo-500/30">
      {/* 
        Arte Algorítmico (Hero Section). 
        Utilizamos LogosGallery que dibuja las constelaciones 
        interactivas hacia el mouse a tamaño 600px.
      */}
      <LogosGallery />

      {/* Aplicación Principal: Lectura y Oráculo */}
      <div className="relative -mt-10 z-20 pb-20">
        <MitoLogosApp />
      </div>
    </div>
  );
}
