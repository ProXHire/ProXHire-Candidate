import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Port 3003 = Candidate / Student Portal (candidate.proxhire.in)
// Port 3000 = Main Job Portal | Port 3001 = Admin | Port 3002 = Employer
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5176,
    strictPort: false,
  },
})
