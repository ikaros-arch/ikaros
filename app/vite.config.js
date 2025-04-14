import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.js'], 
    env: {
      // Provide test values for environment variables
      VITE_MODULES: '["test"]',
      VITE_DOMAIN: 'test-domain.com',
      VITE_DB_API: 'http://test-api',
      VITE_ONLINE: 'true',
      VITE_TITLE: 'Test App',
      VITE_KC_URL: 'http://test-keycloak',
      VITE_KC_REALM: 'test-realm',
      VITE_KC_CLIENT: 'test-client'
    }    
  },  
  resolve: {
    alias: {
      '@': '/src',
      'assets': '/src/assets',
      'components': '/src/components',
      'helpers': '/src/helpers',
      'hooks': '/src/hooks',
      'pages': '/src/pages',
      'services': '/src/services',
    },
    extensions: ['.js', '.jsx'],
  },
  server: {
    port: 3000,
    host: true,
    hmr: {
      host: process.env.VITE_DOMAIN,
      protocol: 'wss', // Use 'wss' for secure WebSocket connection if using HTTPS
      clientPort: 443,      
    },
    allowedHosts: true
    //allowedHosts: ['all'],    
  },    
});