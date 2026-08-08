import { Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import HomePage from './pages/HomePage';
import BookDetailsPage from './pages/BookDetailsPage';

function App() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route index element={<HomePage />} />
                <Route
                    path="books/:googleBooksId"
                    element={<BookDetailsPage />}
                />
            </Route>
        </Routes>
    );
}

export default App;
