import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TamaguiProvider } from 'tamagui'
import tamaguiConfig from './tamagui.config'
import './index.css'
import App from './App'
import { AuthProvider } from './lib/auth'
import { isSupabaseConfigured } from './lib/supabase'
import EnvSetupNotice from './components/EnvSetupNotice'

const root = createRoot(document.getElementById('root')!)

if (!isSupabaseConfigured) {
  root.render(
    <StrictMode>
      <EnvSetupNotice />
    </StrictMode>,
  )
} else {
  root.render(
    <StrictMode>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
        <AuthProvider>
          <App />
        </AuthProvider>
      </TamaguiProvider>
    </StrictMode>,
  )
}

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration failed — app still works normally
    })
  })
}
