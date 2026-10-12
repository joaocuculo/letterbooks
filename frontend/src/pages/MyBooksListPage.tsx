import { Navigate, useLocation } from 'react-router-dom';
import { isUserBookStatus } from '../utils/userBookStatus';
export default function MyBooksListPage() {
    const { search } = useLocation();
    const params = new URLSearchParams(search);
    if (
        !isUserBookStatus(params.get('status')) &&
        params.get('favorite') !== 'true'
    )
        params.set('view', 'all');
    return (
        <Navigate
            replace
            to={{ pathname: '/my-books', search: params.toString() }}
        />
    );
}
