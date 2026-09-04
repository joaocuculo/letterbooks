import { Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import HomePage from './pages/HomePage';
import BookDetailsPage from './pages/BookDetailsPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import ProfilePage from './pages/ProfilePage';
import MyBooksPage from './pages/MyBooksPage';
import MyBooksListPage from './pages/MyBooksListPage';
import SearchPage from './pages/SearchPage';

function App() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route index element={<HomePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="search" element={<SearchPage />} />
                <Route
                    path="books/:googleBooksId"
                    element={<BookDetailsPage />}
                />
                <Route element={<ProtectedRoute />}>
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="my-books" element={<MyBooksPage />} />
                    <Route
                        path="my-books/list"
                        element={<MyBooksListPage />}
                    />
                </Route>
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}

export default App;
