import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mito y Logos',
  description: 'Control de lectura interactivo - Universidad Anáhuac',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-[#0a0a0c] text-slate-200 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/10 blur-[150px] rounded-full"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[150px] rounded-full"></div>
        </div>
        
        {/* Header Anclado con la Autoría */}
        <header className="fixed top-0 w-full bg-[#0a0a0c]/80 backdrop-blur-md border-b border-white/5 z-50">
            <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
                <div className="text-white/60 font-bold tracking-widest text-xs uppercase">
                    UNIVERSIDAD ANÁHUAC
                </div>
                <div className="text-indigo-400/80 font-medium text-sm flex items-center gap-2">
                    Elaborada por el doctor <strong>Mario A. Ramírez Barajas</strong>
                </div>
            </div>
        </header>

        <main className="relative z-10 pt-14">
            {children}
        </main>
      </body>
    </html>
  )
}
