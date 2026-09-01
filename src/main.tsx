import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import { TRPCProvider } from "./providers/trpc"
import { CartProvider } from "./providers/cart"
import { LanguageProvider } from "./providers/language"
import { TableSessionProvider } from "./providers/tableSession"
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <LanguageProvider>
      <TRPCProvider>
        <TableSessionProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </TableSessionProvider>
      </TRPCProvider>
    </LanguageProvider>
  </BrowserRouter>,
)