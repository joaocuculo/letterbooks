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
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminRoute from './components/AdminRoute';
import AuthorsAdminPage from './pages/AuthorsAdminPage';
import AuthorAdminDetailsPage from './pages/AuthorAdminDetailsPage';
import CategoriesAdminPage from './pages/CategoriesAdminPage';
import CategoryAdminDetailsPage from './pages/CategoryAdminDetailsPage';

function App() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route index element={<HomePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
                <Route path="reset-password" element={<ResetPasswordPage />} />
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
                    <Route element={<AdminRoute />}>
                        <Route path="admin/authors" element={<AuthorsAdminPage />} />
                        <Route
                            path="admin/authors/:authorId"
                            element={<AuthorAdminDetailsPage />}
                        />
                        <Route path="admin/categories" element={<CategoriesAdminPage />} />
                        <Route
                            path="admin/categories/:categoryId"
                            element={<CategoryAdminDetailsPage />}
                        />
                    </Route>
                </Route>
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}

export default App;
