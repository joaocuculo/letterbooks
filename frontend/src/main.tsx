import { Toaster } from './components/ui/toast';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { TooltipProvider } from './components/ui/tooltip';

const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error('Elemento root não encontrado.');
}

const router = createBrowserRouter([{ path: '*', element: <App /> }]);

createRoot(rootElement).render(
    <StrictMode>
        <TooltipProvider>
            <Toaster>
                <RouterProvider router={router} />
            </Toaster>
        </TooltipProvider>
    </StrictMode>
);
