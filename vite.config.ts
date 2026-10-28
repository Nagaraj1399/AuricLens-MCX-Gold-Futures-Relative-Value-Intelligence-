import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.VITE_SUPABASE_URL': JSON.stringify(
        process.env.VITE_SUPABASE_URL || 'https://sfcczrhorpxctukbikkf.supabase.co'
      ),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(
        process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_cfpEMGgbM4OB_21Pawloqg_GPVo8NL2'
      ),
      'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sfcczrhorpxctukbikkf.supabase.co'
      ),
      'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_cfpEMGgbM4OB_21Pawloqg_GPVo8NL2'
      ),
      'process.env.VITE_DEFAULT_REPO_RATE': JSON.stringify(
        process.env.VITE_DEFAULT_REPO_RATE || '6.5'
      ),
      'process.env.VITE_DEFAULT_STORAGE_COST': JSON.stringify(
        process.env.VITE_DEFAULT_STORAGE_COST || '0.25'
      ),
      'process.env.VITE_DEFAULT_BROKERAGE_PER_ORDER': JSON.stringify(
        process.env.VITE_DEFAULT_BROKERAGE_PER_ORDER || '20'
      ),
      'process.env.VITE_DEFAULT_SLIPPAGE_TICKS': JSON.stringify(
        process.env.VITE_DEFAULT_SLIPPAGE_TICKS || '1'
      ),
      'process.env.NEXT_PUBLIC_TINYFISH_API_KEY': JSON.stringify(
        process.env.NEXT_PUBLIC_TINYFISH_API_KEY || 'sk-tinyfish-Fna9NAJi9JGqQxKhH9HRXmkU-5x00PPU'
      ),
      'process.env.TINYFISH_API_KEY': JSON.stringify(
        process.env.TINYFISH_API_KEY || 'sk-tinyfish-Fna9NAJi9JGqQxKhH9HRXmkU-5x00PPU'
      ),
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
        'next/link': path.resolve(import.meta.dirname, './src/lib/router.tsx'),
        'next/navigation': path.resolve(import.meta.dirname, './src/lib/router.tsx'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
