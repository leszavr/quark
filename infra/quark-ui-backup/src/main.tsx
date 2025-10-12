import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AppLayoutNew from './AppLayoutNew.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppLayoutNew />
  </StrictMode>,
)
