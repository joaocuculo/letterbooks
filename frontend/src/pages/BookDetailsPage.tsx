import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { BookResponse } from '../types/book';
import axios from 'axios';
import { getBookById } from '../services/bookService';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';

function BookDetailsPage() {
    const { googleBooksId } = useParams<{ googleBooksId: string }>();

    const [book, setBook] = useState<BookResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!googleBooksId) {
            return;
        }

        const requestedBookId = googleBooksId;
        const abortController = new AbortController();

        async function loadBook() {
            try {
                setIsLoading(true);
                setErrorMessage(null);

                const result = await getBookById(
                    requestedBookId,
                    abortController.signal
                );

                setBook(result);
            } catch (error) {
                if (!axios.isCancel(error)) {
                    setBook(null);
                    setErrorMessage(
                        getApiErrorMessage(
                            error,
                            'Não foi possível carregar o livro.'
                        )
                    );
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        void loadBook();

        return () => abortController.abort();
    }, [googleBooksId]);

    if (!googleBooksId) {
        return (
            <div>
                <h1>Identificador inválido.</h1>
                <p>O identificador do livro não foi informado na URL.</p>
                <Link to="/"> Voltar à página inicial</Link>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div>
                <p>Carregando livro...</p>
            </div>
        );
    }

    if (errorMessage || !book) {
        return (
            <div>
                <h1>Livro não encontrado.</h1>
                <p>{errorMessage ?? 'Não encontramos esse livro.'}</p>
                <Link to="/">Voltar à página inicial</Link>
            </div>
        );
    }

    const authors = book.authors?.join(', ') ?? 'Autor não informado.';
    const categories = book.categories?.join(', ') ?? 'Sem categoria.';
    const coverUrl = (book.thumbnailUrl || book.imageUrl)?.replace(
        /^http:/,
        'https:'
    );

    return (
        <div>
            <Link to="/">← Voltar à página inicial</Link>

            <article>
                <div>
                    {coverUrl ? (
                        <img
                            src={coverUrl}
                            alt={`Capa do livro ${book.title}`}
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div>Sem capa disponível</div>
                    )}
                </div>

                <div>
                    <h1>{book.title}</h1>

                    {book.subtitle && <p>{book.subtitle}</p>}

                    <div>
                        <p>
                            <strong>Autores: </strong>
                            {authors}
                        </p>

                        <p>
                            <strong>Editora: </strong>
                            {book.publisher ?? 'Não informada.'}
                        </p>

                        <p>
                            <strong>Publicação: </strong>
                            {book.publishedDate ?? 'Não informada.'}
                        </p>

                        <p>
                            <strong>Categorias: </strong>
                            {categories}
                        </p>

                        <p>
                            <strong>Páginas: </strong>
                            {book.pageCount ?? 'Não informado.'}
                        </p>

                        <p>
                            <strong>ISBN: </strong>
                            {book.isbn ?? 'Não informado.'}
                        </p>

                        <p>{book.description ?? 'Descrição não disponível.'}</p>
                    </div>
                </div>
            </article>
        </div>
    );
}

export default BookDetailsPage;
