import { Navigate, useLocation } from 'react-router-dom';

export default function SearchPage() {
    const location = useLocation();
    return (
        <Navigate replace to={`/explore${location.search}${location.hash}`} />
    );
}
