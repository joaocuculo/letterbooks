import { Toaster } from './components/ui/toast';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import { TooltipProvider } from './components/ui/tooltip';

const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error('Elemento root não encontrado.');
}

createRoot(rootElement).render(
    <StrictMode>
        <BrowserRouter>
            <TooltipProvider>
                <Toaster>
                    <App />
                </Toaster>
            </TooltipProvider>
        </BrowserRouter>
    </StrictMode>
);
