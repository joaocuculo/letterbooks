import axios from 'axios';
import { useEffect, useState, type SubmitEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    addCategoryAlternativeName,
    changeCategoryPrimaryName,
    findCategories,
    findCategoryById,
    findCategoryNames,
    mergeCategories,
    removeCategoryName,
} from '../services/categoryService';
import type { CategoryNameResponse, CategoryResponse } from '../types/category';
import type { PageResponse } from '../types/page';
import { getApiErrorMessage } from '../utils/getApiErrorMessage.';

function CategoryAdminDetailsPage() {
    const { categoryId: categoryIdParam } = useParams();
    const navigate = useNavigate();
    const categoryId = Number(categoryIdParam);
    const hasValidCategoryId = Number.isInteger(categoryId) && categoryId > 0;

    const [category, setCategory] = useState<CategoryResponse | null>(null);
    const [names, setNames] = useState<CategoryNameResponse[]>([]);
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
    const [sourceResult, setSourceResult] = useState<PageResponse<CategoryResponse> | null>(null);
    const [selectedSource, setSelectedSource] = useState<CategoryResponse | null>(null);
    const [isLoadingSources, setIsLoadingSources] = useState(true);
    const [sourceErrorMessage, setSourceErrorMessage] = useState<string | null>(null);
    const [isMerging, setIsMerging] = useState(false);
    const [mergeErrorMessage, setMergeErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!hasValidCategoryId) {
            return;
        }

        const abortController = new AbortController();

        async function loadCategory() {
            try {
                setIsLoading(true);
                setLoadErrorMessage(null);
                const [loadedCategory, loadedNames] = await Promise.all([
                    findCategoryById(categoryId, abortController.signal),
                    findCategoryNames(categoryId, abortController.signal),
                ]);
                setCategory(loadedCategory);
                setNames(loadedNames);
            } catch (error) {
                if (!axios.isCancel(error)) {
                    setCategory(null);
                    setNames([]);
                    setLoadErrorMessage(
                        getApiErrorMessage(error, 'Não foi possível carregar a categoria.')
                    );
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        void loadCategory();
        return () => abortController.abort();
    }, [categoryId, hasValidCategoryId, reloadKey]);

    useEffect(() => {
        if (!hasValidCategoryId) {
            return;
        }

        const abortController = new AbortController();

        async function loadSources() {
            try {
                setIsLoadingSources(true);
                setSourceErrorMessage(null);
                setSourceResult(await findCategories(sourcePage, abortController.signal));
            } catch (error) {
                if (!axios.isCancel(error)) {
                    setSourceResult(null);
                    setSourceErrorMessage(
                        getApiErrorMessage(error, 'Não foi possível carregar as categorias para o merge.')
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
    }, [categoryId, hasValidCategoryId, sourcePage]);

    function reloadCategory() {
        setReloadKey((current) => current + 1);
    }

    async function handleAddName(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        const normalizedName = alternativeName.trim();
        if (!normalizedName || !hasValidCategoryId) {
            setNameErrorMessage('Informe o nome alternativo.');
            return;
        }

        try {
            setIsAddingName(true);
            setNameErrorMessage(null);
            setNameSuccessMessage(null);
            await addCategoryAlternativeName(categoryId, normalizedName);
            setAlternativeName('');
            setNameSuccessMessage('Nome alternativo adicionado com sucesso.');
            reloadCategory();
        } catch (error) {
            setNameErrorMessage(
                getApiErrorMessage(error, 'Não foi possível adicionar o nome alternativo.')
            );
        } finally {
            setIsAddingName(false);
        }
    }

    async function handleChangePrimary(categoryNameId: number) {
        try {
            setChangingNameId(categoryNameId);
            setNameErrorMessage(null);
            setNameSuccessMessage(null);
            await changeCategoryPrimaryName(categoryId, categoryNameId);
            setNameSuccessMessage('Nome principal alterado com sucesso.');
            reloadCategory();
        } catch (error) {
            setNameErrorMessage(
                getApiErrorMessage(error, 'Não foi possível alterar o nome principal.')
            );
        } finally {
            setChangingNameId(null);
        }
    }

    async function handleRemoveName(categoryName: CategoryNameResponse) {
        const confirmed = window.confirm(`Remover o nome “${categoryName.name}”?`);
        if (!confirmed) {
            return;
        }

        try {
            setRemovingNameId(categoryName.id);
            setNameErrorMessage(null);
            setNameSuccessMessage(null);
            await removeCategoryName(categoryId, categoryName.id);
            setNameSuccessMessage('Nome removido com sucesso.');
            reloadCategory();
        } catch (error) {
            setNameErrorMessage(
                getApiErrorMessage(error, 'Não foi possível remover o nome.')
            );
        } finally {
            setRemovingNameId(null);
        }
    }

    async function handleMerge() {
        if (!category || !selectedSource) {
            setMergeErrorMessage('Selecione a categoria de origem.');
            return;
        }

        const confirmed = window.confirm(
            `A categoria “${selectedSource.name}” será excluída e seus nomes e livros serão transferidos para “${category.name}”. Deseja continuar?`
        );
        if (!confirmed) {
            return;
        }

        try {
            setIsMerging(true);
            setMergeErrorMessage(null);
            await mergeCategories({
                targetCategoryId: category.id,
                sourceCategoryId: selectedSource.id,
            });
            navigate('/admin/categories', {
                replace: true,
                state: { successMessage: 'Categorias unidas com sucesso.' },
            });
        } catch (error) {
            setMergeErrorMessage(
                getApiErrorMessage(error, 'Não foi possível unir as categorias.')
            );
        } finally {
            setIsMerging(false);
        }
    }

    if (!hasValidCategoryId) {
        return (
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6">
                <Link to="/admin/categories">← Voltar para categorias</Link>
                <p role="alert">O identificador da categoria é inválido.</p>
            </div>
        );
    }

    if (isLoading) {
        return <p className="mx-auto max-w-7xl px-4 py-6">Carregando categoria...</p>;
    }

    if (loadErrorMessage || !category) {
        return (
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6">
                <Link to="/admin/categories">← Voltar para categorias</Link>
                <p role="alert">{loadErrorMessage ?? 'Categoria não encontrada.'}</p>
            </div>
        );
    }

    const availableSources = sourceResult?.content.filter((source) => source.id !== category.id) ?? [];

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6">
            <section className="flex flex-col gap-3">
                <Link to="/admin/categories">← Voltar para categorias</Link>
                <h1>{category.name}</h1>
                <p>ID: {category.id}</p>
            </section>

            <section className="flex flex-col gap-4">
                <h2>Nomes da categoria</h2>
                <ul className="flex flex-col gap-2">
                    {names.map((categoryName) => (
                        <li className="flex flex-wrap items-center gap-3" key={categoryName.id}>
                            <span>{categoryName.name}</span>
                            {categoryName.primary ? (
                                <span>Nome principal</span>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => void handleChangePrimary(categoryName.id)}
                                        disabled={changingNameId !== null || removingNameId !== null}
                                    >
                                        {changingNameId === categoryName.id ? 'Alterando...' : 'Tornar principal'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => void handleRemoveName(categoryName)}
                                        disabled={changingNameId !== null || removingNameId !== null}
                                    >
                                        {removingNameId === categoryName.id ? 'Removendo...' : 'Remover'}
                                    </button>
                                </>
                            )}
                        </li>
                    ))}
                </ul>

                <form className="flex max-w-xl flex-col gap-3" onSubmit={handleAddName}>
                    <label htmlFor="category-alternative-name">Novo nome alternativo</label>
                    <input
                        id="category-alternative-name"
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
                <h2>Unir categorias</h2>
                <p>Esta categoria será o destino. Escolha a categoria que será absorvida e excluída.</p>

                {selectedSource && (
                    <p>Origem selecionada: ID {selectedSource.id} — {selectedSource.name}</p>
                )}

                {isLoadingSources ? (
                    <p>Carregando categorias...</p>
                ) : sourceErrorMessage ? (
                    <p role="alert">{sourceErrorMessage}</p>
                ) : availableSources.length === 0 ? (
                    <p>Nenhuma categoria disponível nesta página.</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {availableSources.map((source) => (
                            <label className="flex items-center gap-2" key={source.id}>
                                <input
                                    type="radio"
                                    name="source-category"
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
                    {isMerging ? 'Unindo...' : 'Unir categorias'}
                </button>
            </section>
        </div>
    );
}

export default CategoryAdminDetailsPage;
