import { useState } from 'react';

function HomePage() {
    const [book, setBook] = useState(null);

    setBook("Livro Teste");

    return (
        <main>
            <h1>Discover</h1>
                <p>{book}</p>
            <p>teste</p>
        </main>
    );
}

export default HomePage;
