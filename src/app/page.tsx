
'use client';
import Link from 'next/link';
import { FileText, Mic, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-luxury-gold to-white bg-clip-text text-transparent">
          Brivex Sales Flow
        </h1>
        <p className="text-xl text-white/60 font-light">
          Gestión de Ventas High-Ticket Simplificada
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
        <Link href="/dossier">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="group card h-64 flex flex-col justify-between cursor-pointer hover:border-luxury-gold/50 transition-all"
          >
            <div className="p-4 bg-luxury-gold/10 w-fit rounded-full text-luxury-gold group-hover:bg-luxury-gold group-hover:text-black transition-colors">
              <FileText size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Instant Dossier</h2>
              <p className="text-white/50">Genera PDFs elegantes con fotos y precios en segundos.</p>
            </div>
            <div className="flex justify-end text-luxury-gold">
              <ChevronRight size={24} />
            </div>
          </motion.div>
        </Link>

        <Link href="/voice">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="group card h-64 flex flex-col justify-between cursor-pointer hover:border-luxury-gold/50 transition-all"
          >
            <div className="p-4 bg-luxury-gold/10 w-fit rounded-full text-luxury-gold group-hover:bg-luxury-gold group-hover:text-black transition-colors">
              <Mic size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Voice Bridge</h2>
              <p className="text-white/50">Graba notas de voz y actualiza Pipedrive automáticamente.</p>
            </div>
            <div className="flex justify-end text-luxury-gold">
              <ChevronRight size={24} />
            </div>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}
