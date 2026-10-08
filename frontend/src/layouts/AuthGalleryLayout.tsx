import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import '../styles/login.css';

const galleryBooks = [
    { isbn: '9786555320213', title: 'Água viva' },
    { isbn: '9788573263350', title: 'Noites brancas' },
    { isbn: '9780441172719', title: 'Duna' },
    { isbn: '9780547928227', title: 'O hobbit' },
    { isbn: '9780141439518', title: 'Orgulho e preconceito' },
];

function AuthGalleryLayout({ children }: { children: ReactNode }) {
    return (
        <div className="login-page">
            <a className="login-skip" href="#login-content">
                Pular para o formulário
            </a>
            <header className="login-header">
                <Link
                    className="login-brand"
                    to="/"
                    aria-label="LetterBooks, início"
                >
                    <svg
                        width="27"
                        height="27"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        aria-hidden="true"
                    >
                        <path d="M12 5c-3-2-6-2-10-1v16c4-1 7-1 10 1 3-2 6-2 10-1V4c-4-1-7-1-10 1Zm0 0v16" />
                    </svg>
                    <span>LetterBooks.</span>
                </Link>
                <Link className="login-back" to="/">
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        aria-hidden="true"
                    >
                        <path d="M20 12H4m6-6-6 6 6 6" />
                    </svg>
                    Voltar ao início
                </Link>
            </header>
            <main className="login-content" id="login-content">
                {children}
                <div className="login-gallery" aria-hidden="true">
                    {galleryBooks.map((book) => (
                        <img
                            key={book.isbn}
                            src={`/images/books/${book.isbn}.jpg`}
                            alt=""
                            width="200"
                            height="300"
                            draggable={false}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}

export default AuthGalleryLayout;
