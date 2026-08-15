'use client';

import { motion } from 'framer-motion';

// /logs alt ağacının tamamını sarar. Tema izolasyonu (.logs-theme, globals.css)
// yalnızca bu wrapper'ın içinde geçerli — NavBar dışarıda kaldığı için
// etkilenmez. Bu layout, /logs ve /logs/[slug] arasında geçişte yeniden monte
// olmaz (App Router aynı segment ağacını korur), bu yüzden fade yalnızca ana
// siteden /logs'a ilk girişte oynar — kart açarken tekrar etmez.
export default function LogsThemeShell({ children, fontVars }: { children: React.ReactNode; fontVars: string }) {
  return (
    <motion.div
      className={`logs-theme ${fontVars}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}
