import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import createCmsApi from './src/cms/cmsApiPlugin.js';

export default defineConfig({
  plugins: [react(), createCmsApi()],
});
