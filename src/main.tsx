import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import { TRPCProvider } from "./providers/trpc"
import { CartProvider } from "./providers/cart"
import { LanguageProvider } from "./providers/language"
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <LanguageProvider>
      <TRPCProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </TRPCProvider>
    </LanguageProvider>
  </BrowserRouter>,
)