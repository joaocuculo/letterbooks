import axios from 'axios';
import { useEffect, useState, type SubmitEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    addAuthorAlternativeName,
    changeAuthorPrimaryName,
    findAuthorById,
    findAuthorNames,
    findAuthors,
    mergeAuthors,
    removeAuthorName,
} from '../services/authorService';
import type { AuthorNameResponse, AuthorResponse } from '../types/author';
import type { PageResponse } from '../types/page';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';

function AuthorAdminDetailsPage() {
    const { authorId: authorIdParam } = useParams();
    const navigate = useNavigate();
    const authorId = Number(authorIdParam);
    const hasValidAuthorId = Number.isInteger(authorId) && authorId > 0;

    const [author, setAuthor] = useState<AuthorResponse | null>(null);
    const [names, setNames] = useState<AuthorNameResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    const [alternativeName, setAlternativeName] = useState('');
    const [isAddingName, setIsAddingName] = useState(false);
    const [changingNameId, setChangingNameId] = useState<number | null>(null);
    const [removingNameId, setRemovingNameId] = useState<number | null>(null);
    const [nameErrorMessage, setNameErrorMessage] = useState<string | null>(null);
    const [nameSuccessMessage, setNameSuccessMessage] = useState<string | null>(null);

    const [sourcePage, setSourcePage] = useState(0);
    const [sourceResult, setSourceResult] = useState<PageResponse<AuthorResponse> | null>(null);
    const [selectedSource, setSelectedSource] = useState<AuthorResponse | null>(null);
    const [isLoadingSources, setIsLoadingSources] = useState(true);
    const [sourceErrorMessage, setSourceErrorMessage] = useState<string | null>(null);
    const [isMerging, setIsMerging] = useState(false);
    const [mergeErrorMessage, setMergeErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!hasValidAuthorId) {
            return;
        }

        const abortController = new AbortController();

        async function loadAuthor() {
            try {
                setIsLoading(true);
                setLoadErrorMessage(null);
                const [loadedAuthor, loadedNames] = await Promise.all([
                    findAuthorById(authorId, abortController.signal),
                    findAuthorNames(authorId, abortController.signal),
                ]);
                setAuthor(loadedAuthor);
                setNames(loadedNames);
            } catch (error) {
                if (!axios.isCancel(error)) {
                    setAuthor(null);
                    setNames([]);
                    setLoadErrorMessage(
                        getApiErrorMessage(error, 'Não foi possível carregar o autor.')
                    );
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        void loadAuthor();
        return () => abortController.abort();
    }, [authorId, hasValidAuthorId, reloadKey]);

    useEffect(() => {
        if (!hasValidAuthorId) {
            return;
        }

        const abortController = new AbortController();

        async function loadSources() {
            try {
                setIsLoadingSources(true);
                setSourceErrorMessage(null);
                setSourceResult(await findAuthors(sourcePage, abortController.signal));
            } catch (error) {
                if (!axios.isCancel(error)) {
                    setSourceResult(null);
                    setSourceErrorMessage(
                        getApiErrorMessage(error, 'Não foi possível carregar os autores para o merge.')
                    );
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setIsLoadingSources(false);
                }
            }
        }

        void loadSources();
        return () => abortController.abort();
    }, [authorId, hasValidAuthorId, sourcePage]);

    function reloadAuthor() {
        setReloadKey((current) => current + 1);
    }

    async function handleAddName(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        const normalizedName = alternativeName.trim();
        if (!normalizedName || !hasValidAuthorId) {
            setNameErrorMessage('Informe o nome alternativo.');
            return;
        }

        try {
            setIsAddingName(true);
            setNameErrorMessage(null);
            setNameSuccessMessage(null);
            await addAuthorAlternativeName(authorId, normalizedName);
            setAlternativeName('');
            setNameSuccessMessage('Nome alternativo adicionado com sucesso.');
            reloadAuthor();
        } catch (error) {
            setNameErrorMessage(
                getApiErrorMessage(error, 'Não foi possível adicionar o nome alternativo.')
            );
        } finally {
            setIsAddingName(false);
        }
    }

    async function handleChangePrimary(authorNameId: number) {
        try {
            setChangingNameId(authorNameId);
            setNameErrorMessage(null);
            setNameSuccessMessage(null);
            await changeAuthorPrimaryName(authorId, authorNameId);
            setNameSuccessMessage('Nome principal alterado com sucesso.');
            reloadAuthor();
        } catch (error) {
            setNameErrorMessage(
                getApiErrorMessage(error, 'Não foi possível alterar o nome principal.')
            );
        } finally {
            setChangingNameId(null);
        }
    }

    async function handleRemoveName(authorName: AuthorNameResponse) {
        const confirmed = window.confirm(`Remover o nome “${authorName.name}”?`);
        if (!confirmed) {
            return;
        }

        try {
            setRemovingNameId(authorName.id);
            setNameErrorMessage(null);
            setNameSuccessMessage(null);
            await removeAuthorName(authorId, authorName.id);
            setNameSuccessMessage('Nome removido com sucesso.');
            reloadAuthor();
        } catch (error) {
            setNameErrorMessage(
                getApiErrorMessage(error, 'Não foi possível remover o nome.')
            );
        } finally {
            setRemovingNameId(null);
        }
    }

    async function handleMerge() {
        if (!author || !selectedSource) {
            setMergeErrorMessage('Selecione o autor de origem.');
            return;
        }

        const confirmed = window.confirm(
            `O autor “${selectedSource.name}” será excluído e seus nomes e livros serão transferidos para “${author.name}”. Deseja continuar?`
        );
        if (!confirmed) {
            return;
        }

        try {
            setIsMerging(true);
            setMergeErrorMessage(null);
            await mergeAuthors({
                targetAuthorId: author.id,
                sourceAuthorId: selectedSource.id,
            });
            navigate('/admin/authors', {
                replace: true,
                state: { successMessage: 'Autores unidos com sucesso.' },
            });
        } catch (error) {
            setMergeErrorMessage(
                getApiErrorMessage(error, 'Não foi possível unir os autores.')
            );
        } finally {
            setIsMerging(false);
        }
    }

    if (!hasValidAuthorId) {
        return (
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6">
                <Link to="/admin/authors">← Voltar para autores</Link>
                <p role="alert">O identificador do autor é inválido.</p>
            </div>
        );
    }

    if (isLoading) {
        return <p className="mx-auto max-w-7xl px-4 py-6">Carregando autor...</p>;
    }

    if (loadErrorMessage || !author) {
        return (
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6">
                <Link to="/admin/authors">← Voltar para autores</Link>
                <p role="alert">{loadErrorMessage ?? 'Autor não encontrado.'}</p>
            </div>
        );
    }

    const availableSources = sourceResult?.content.filter((source) => source.id !== author.id) ?? [];

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6">
            <section className="flex flex-col gap-3">
                <Link to="/admin/authors">← Voltar para autores</Link>
                <h1>{author.name}</h1>
                <p>ID: {author.id}</p>
            </section>

            <section className="flex flex-col gap-4">
                <h2>Nomes do autor</h2>
                <ul className="flex flex-col gap-2">
                    {names.map((authorName) => (
                        <li className="flex flex-wrap items-center gap-3" key={authorName.id}>
                            <span>{authorName.name}</span>
                            {authorName.primary ? (
                                <span>Nome principal</span>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => void handleChangePrimary(authorName.id)}
                                        disabled={changingNameId !== null || removingNameId !== null}
                                    >
                                        {changingNameId === authorName.id ? 'Alterando...' : 'Tornar principal'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => void handleRemoveName(authorName)}
                                        disabled={changingNameId !== null || removingNameId !== null}
                                    >
                                        {removingNameId === authorName.id ? 'Removendo...' : 'Remover'}
                                    </button>
                                </>
                            )}
                        </li>
                    ))}
                </ul>

                <form className="flex max-w-xl flex-col gap-3" onSubmit={handleAddName}>
                    <label htmlFor="author-alternative-name">Novo nome alternativo</label>
                    <input
                        id="author-alternative-name"
                        value={alternativeName}
                        onChange={(event) => setAlternativeName(event.target.value)}
                        disabled={isAddingName}
                    />
                    <button className="self-start" type="submit" disabled={isAddingName}>
                        {isAddingName ? 'Adicionando...' : 'Adicionar nome'}
                    </button>
                </form>
                {nameErrorMessage && <p role="alert">{nameErrorMessage}</p>}
                {nameSuccessMessage && <p role="status">{nameSuccessMessage}</p>}
            </section>

            <section className="flex flex-col gap-4">
                <h2>Unir autores</h2>
                <p>Este autor será o destino. Escolha o autor que será absorvido e excluído.</p>

                {selectedSource && (
                    <p>Origem selecionada: ID {selectedSource.id} — {selectedSource.name}</p>
                )}

                {isLoadingSources ? (
                    <p>Carregando autores...</p>
                ) : sourceErrorMessage ? (
                    <p role="alert">{sourceErrorMessage}</p>
                ) : availableSources.length === 0 ? (
                    <p>Nenhum autor disponível nesta página.</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {availableSources.map((source) => (
                            <label className="flex items-center gap-2" key={source.id}>
                                <input
                                    type="radio"
                                    name="source-author"
                                    checked={selectedSource?.id === source.id}
                                    onChange={() => setSelectedSource(source)}
                                />
                                ID {source.id} — {source.name}
                            </label>
                        ))}
                    </div>
                )}

                {sourceResult && sourceResult.page.totalPages > 1 && (
                    <nav className="flex items-center gap-4" aria-label="Paginação das origens do merge">
                        <button
                            type="button"
                            onClick={() => setSourcePage((current) => current - 1)}
                            disabled={sourcePage === 0 || isLoadingSources}
                        >
                            Anterior
                        </button>
                        <span>Página {sourceResult.page.number + 1} de {sourceResult.page.totalPages}</span>
                        <button
                            type="button"
                            onClick={() => setSourcePage((current) => current + 1)}
                            disabled={sourcePage + 1 >= sourceResult.page.totalPages || isLoadingSources}
                        >
                            Próxima
                        </button>
                    </nav>
                )}

                {mergeErrorMessage && <p role="alert">{mergeErrorMessage}</p>}
                <button
                    className="self-start"
                    type="button"
                    onClick={() => void handleMerge()}
                    disabled={!selectedSource || isMerging}
                >
                    {isMerging ? 'Unindo...' : 'Unir autores'}
                </button>
            </section>
        </div>
    );
}

export default AuthorAdminDetailsPage;
