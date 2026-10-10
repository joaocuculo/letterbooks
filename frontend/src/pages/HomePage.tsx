import SiteHeader from '../components/SiteHeader';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/home.css';
import { homeBookColumns, type HomeBook } from '../data/homeBooks';

const books = [
    {
        isbn: '9780143107637',
        title: 'Crime e castigo',
        author: 'Fiódor Dostoiévski',
    },
    {
        isbn: '9780141439518',
        title: 'Orgulho e preconceito',
        author: 'Jane Austen',
    },
    {
        isbn: '9780141439556',
        title: 'O morro dos ventos uivantes',
        author: 'Emily Brontë',
    },
    {
        isbn: '9780140449136',
        title: 'Crime e castigo',
        author: 'Fiódor Dostoiévski',
    },
    { isbn: '9780441172719', title: 'Duna', author: 'Frank Herbert' },
    { isbn: '9780451524935', title: '1984', author: 'George Orwell' },
    {
        isbn: '9780061120084',
        title: 'O sol é para todos',
        author: 'Harper Lee',
    },
    { isbn: '9780142437247', title: 'Moby Dick', author: 'Herman Melville' },
    { isbn: '9780141187761', title: 'A metamorfose', author: 'Franz Kafka' },
    { isbn: '9780547928227', title: 'O hobbit', author: 'J. R. R. Tolkien' },
    {
        isbn: '9780060850524',
        title: 'Admirável mundo novo',
        author: 'Aldous Huxley',
    },
    {
        isbn: '9780140449266',
        title: 'O conde de Monte Cristo',
        author: 'Alexandre Dumas',
    },
];
const reviews = [
    {
        book: books[3],
        name: 'Clara',
        initials: 'CL',
        score: 5,
        text: 'Tem livros que terminam na última página. Este continua com a gente por muito tempo.',
    },
    {
        book: books[1],
        name: 'Gabriel',
        initials: 'GA',
        score: 4,
        text: 'Vim pela história de amor. Fiquei pela ironia da Jane Austen. Já quero reler.',
    },
    {
        book: books[4],
        name: 'Luísa',
        initials: 'LU',
        score: 5,
        text: 'Um universo inteiro entre duas capas. Daqueles que fazem a leitura virar uma viagem.',
    },
];

function Arrow({ back = false }: { back?: boolean }) {
    const Icon = back ? ArrowLeft : ArrowRight;
    return <Icon size={20} strokeWidth={1.7} aria-hidden="true" />;
}

function Cover({
    index,
    decorative = false,
    book: selectedBook,
}: {
    index: number;
    decorative?: boolean;
    book?: HomeBook;
}) {
    const book = selectedBook ?? books[index % books.length];
    const [failed, setFailed] = useState(false);
    return (
        <div className={`landing-cover cover-tone-${index % 4}`}>
            {!failed ? (
                <img
                    src={`/images/books/${book.isbn}.jpg`}
                    alt={decorative ? '' : `${book.title}, de ${book.author}`}
                    onError={() => setFailed(true)}
                    loading={decorative || index < 6 ? 'eager' : 'lazy'}
                />
            ) : (
                <span className="cover-fallback">
                    {book.title}
                    <small>{book.author}</small>
                </span>
            )}
        </div>
    );
}

function ReviewStack() {
    const [active, setActive] = useState(0);
    const review = reviews[active];
    return (
        <div className="review-area">
            <div className="review-stack">
                <article
                    className="review-card"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    <div className="review-person">
                        <span className="review-avatar">{review.initials}</span>
                        <div>
                            <strong>{review.name}</strong>
                            <span>sobre {review.book.title}</span>
                        </div>
                        <span
                            className="review-score"
                            aria-label={`${review.score} de 5 estrelas`}
                        >
                            <Star
                                size={16}
                                fill="currentColor"
                                aria-hidden="true"
                            />
                            {review.score}.0
                        </span>
                    </div>
                    <blockquote>“{review.text}”</blockquote>
                </article>
            </div>
            <div className="review-controls">
                <small>Avaliações ilustrativas</small>
                <div>
                    <button
                        type="button"
                        aria-label="Avaliação anterior"
                        onClick={() =>
                            setActive(
                                (active + reviews.length - 1) % reviews.length
                            )
                        }
                    >
                        <Arrow back />
                    </button>
                    <span>
                        {active + 1} / {reviews.length}
                    </span>
                    <button
                        type="button"
                        aria-label="Próxima avaliação"
                        onClick={() => setActive((active + 1) % reviews.length)}
                    >
                        <Arrow />
                    </button>
                </div>
            </div>
        </div>
    );
}

function HomePage() {
    const { isAuthenticated } = useAuth();
    const actionLink = isAuthenticated ? '/my-books' : '/register';
    const heroRef = useRef<HTMLElement>(null);
    const [paused, setPaused] = useState(false);
    const [heroVisible, setHeroVisible] = useState(true);
    const [pageVisible, setPageVisible] = useState(!document.hidden);
    const [reducedMotion, setReducedMotion] = useState(
        () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            setHeroVisible(entry.isIntersecting);
        });
        if (heroRef.current) observer.observe(heroRef.current);

        function updateVisibility() {
            setPageVisible(!document.hidden);
        }
        const preference = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        );
        function updateMotion() {
            setReducedMotion(preference.matches);
        }
        document.addEventListener('visibilitychange', updateVisibility);
        preference.addEventListener('change', updateMotion);
        return () => {
            observer.disconnect();
            document.removeEventListener('visibilitychange', updateVisibility);
            preference.removeEventListener('change', updateMotion);
        };
    }, []);

    const motionPaused =
        paused || !heroVisible || !pageVisible || reducedMotion;

    return (
        <div className="landing landing-diagonal">
            <a className="landing-skip" href="#home-content">
                Pular para o conteúdo
            </a>
            <SiteHeader />
            <main id="home-content">
                <section
                    className={`landing-hero ${motionPaused ? 'motion-paused' : ''}`}
                    aria-labelledby="hero-title"
                    ref={heroRef}
                >
                    <div className="hero-books" aria-hidden="true">
                        <div className="diagonal-grid">
                            {homeBookColumns.map((columnBooks, column) => (
                                <div className="diagonal-column" key={column}>
                                    <div className="diagonal-track">
                                        {[0, 1].map((copy) => (
                                            <div
                                                className="diagonal-group"
                                                key={copy}
                                            >
                                                {columnBooks
                                                    .concat(columnBooks)
                                                    .map((book, position) => (
                                                        <Cover
                                                            key={`${book.isbn}-${position}`}
                                                            index={
                                                                column * 6 +
                                                                position
                                                            }
                                                            book={book}
                                                            decorative
                                                        />
                                                    ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="hero-copy">
                        <div className="hero-intro">
                            <h1 id="hero-title">
                                Toda leitura
                                <br />
                                merece um <em>lugar.</em>
                            </h1>
                            <p>
                                Organize suas leituras, avalie cada história e
                                encontre o próximo livro que vai ficar com você.
                            </p>
                            <div className="hero-actions">
                                <Link
                                    to={actionLink}
                                    className="landing-button"
                                >
                                    {isAuthenticated
                                        ? 'Abrir minha biblioteca'
                                        : 'Comece sua estante'}
                                    <Arrow />
                                </Link>
                                <Link
                                    to="/explore"
                                    className="landing-text-link"
                                >
                                    Explorar livros <Arrow />
                                </Link>
                            </div>
                        </div>
                        <ReviewStack />
                    </div>
                    {!reducedMotion && (
                        <button
                            type="button"
                            className="motion-toggle"
                            onClick={() => setPaused(!paused)}
                            aria-pressed={paused}
                        >
                            {paused ? (
                                <Play
                                    size={14}
                                    strokeWidth={1.7}
                                    aria-hidden="true"
                                />
                            ) : (
                                <Pause
                                    size={14}
                                    strokeWidth={1.7}
                                    aria-hidden="true"
                                />
                            )}
                            {paused ? 'Retomar movimento' : 'Pausar movimento'}
                        </button>
                    )}
                </section>
                <section
                    id="possibilities"
                    className="landing-possibilities"
                    aria-labelledby="possibilities-title"
                >
                    <div className="possibilities-heading">
                        <h2 id="possibilities-title">
                            Ler é só
                            <br />
                            <em>o começo.</em>
                        </h2>
                        <p>
                            Do primeiro interesse à última página.
                            <br />
                            Um espaço para a sua relação com os livros.
                        </p>
                    </div>
                    <div className="possibility-library">
                        <div className="possibility-copy">
                            <h3>
                                Uma biblioteca
                                <br />
                                com a sua história.
                            </h3>
                            <p>
                                Separe o que quer ler, acompanhe suas leituras e
                                mantenha por perto os seus favoritos.
                            </p>
                            <Link to={actionLink} className="landing-text-link">
                                Organizar minhas leituras <Arrow />
                            </Link>
                        </div>
                        <div className="library-preview">
                            <div className="library-preview-heading">
                                <strong>Minha biblioteca</strong>
                                <span>Exemplo de organização</span>
                            </div>
                            <div className="library-status">
                                <span className="selected">Quero ler</span>
                                <span>Lendo</span>
                                <span>Lidos</span>
                            </div>
                            <div className="library-books">
                                {[4, 9, 1].map((index) => (
                                    <div key={index}>
                                        <Cover index={index} />
                                        <strong>{books[index].title}</strong>
                                        <small>{books[index].author}</small>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="possibility-reviews">
                        <div className="possibility-copy">
                            <h3>
                                O livro termina.
                                <br />
                                Sua opinião fica.
                            </h3>
                            <p>
                                Dê uma nota, registre o que sentiu e volte às
                                histórias pelo que elas significaram para você.
                            </p>
                            <Link to="/explore" className="landing-text-link">
                                Encontrar um livro para avaliar <Arrow />
                            </Link>
                        </div>
                        <ReviewStack />
                    </div>
                    <div className="landing-shelves">
                        <h3>Cada livro no seu lugar.</h3>
                        <p>
                            Estantes personalizadas para reunir histórias por
                            tema, momento ou vontade.
                        </p>
                        <div
                            className="shelf-examples"
                            aria-label="Exemplos de estantes personalizadas"
                        >
                            <span>Para ler nas férias</span>
                            <span>Histórias que ficam</span>
                            <span>Meus clássicos</span>
                        </div>
                        <small>
                            Prévia do recurso de estantes. Interface em
                            desenvolvimento.
                        </small>
                    </div>
                </section>
                <section className="landing-closing">
                    <h2>
                        Sua próxima história
                        <br />
                        <em>começa aqui.</em>
                    </h2>
                    <Link to={actionLink} className="landing-button">
                        {isAuthenticated
                            ? 'Ir para meus livros'
                            : 'Criar minha conta'}
                        <Arrow />
                    </Link>
                </section>
            </main>
            <footer className="landing-footer">
                <Link to="/" className="landing-brand">
                    LetterBooks.
                </Link>
                <span>Um lugar para cada leitura.</span>
                <Link to="/explore">
                    Encontre sua próxima história <Arrow />
                </Link>
            </footer>
        </div>
    );
}

export default HomePage;
