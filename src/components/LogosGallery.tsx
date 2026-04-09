'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import with SSR disabled is REQUIRED for p5.js in Next.js
const Sketch = dynamic(() => import('react-p5').then(mod => mod.default), {
  ssr: false,
});

import p5Types from 'p5';

const LogosGallery: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  let points: p5Types.Vector[] = [];
  const count = 12;

  useEffect(() => {
    setMounted(true);
  }, []);

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    // Uso del ancho del contenedor en lugar de windowWidth asegura responsividad
    p5.createCanvas(canvasParentRef.clientWidth, 600).parent(canvasParentRef);

    for (let i = 0; i < count; i++) {
      points.push(p5.createVector(p5.random(p5.width), p5.random(p5.height)));
    }

    p5.background(10, 10, 12);
  };

  const draw = (p5: p5Types) => {
    p5.fill(10, 10, 12, 20);
    p5.noStroke();
    p5.rect(0, 0, p5.width, p5.height);

    const mouse = p5.createVector(p5.mouseX, p5.mouseY);

    p5.stroke(194, 161, 64, 150);
    p5.strokeWeight(0.8);
    p5.noFill();

    points.forEach((p, i) => {
      let force = p5Types.Vector.sub(mouse, p);
      let dist = force.mag();

      if (dist < 300) {
        force.setMag(0.15);
        p.add(force);
      } else {
        p.add(p5Types.Vector.random2D().mult(0.5));
      }

      // Evita salir del lienzo reseteando la posición si sale
      if (p.x < 0 || p.x > p5.width || p.y < 0 || p.y > p5.height) {
         p.set(p5.random(p5.width), p5.random(p5.height));
      }

      for (let j = i + 1; j < points.length; j++) {
        let d = p5.dist(p.x, p.y, points[j].x, points[j].y);
        if (d < 250) {
          let alpha = p5.map(p5.dist(mouse.x, mouse.y, p.x, p.y), 0, 400, 200, 0);
          p5.stroke(194, 161, 64, alpha);
          p5.line(p.x, p.y, points[j].x, points[j].y);
        }
      }

      p5.ellipse(p.x, p.y, 2, 2);
    });
  };

  const windowResized = (p5: p5Types) => {
     // Reajustar responsivamente
     p5.resizeCanvas(p5.windowWidth, 600);
  }

  if (!mounted) return <div className="w-full h-[600px] bg-[#0a0a0c]" />;

  return (
    <div className="w-full h-[600px] overflow-hidden bg-[#0a0a0c] cursor-crosshair border-b border-[#dfaf66]/20 relative flex items-center justify-center">
      <div className="w-full h-full absolute inset-0 z-0">
         <Sketch setup={setup} draw={draw} windowResized={windowResized} />
      </div>
      <div className="absolute top-10 left-10 text-white/40 font-light tracking-widest text-xs uppercase z-10 pointer-events-none">
        Del Caos al Logos // Interacción Primigenia
      </div>
      <div className="z-10 pointer-events-none text-center">
         <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 tracking-[0.2em] uppercase">
             EL LOGOS: EL PASO DEL MITO AL LOGOS
         </h1>
      </div>
    </div>
  );
};

export default LogosGallery;
