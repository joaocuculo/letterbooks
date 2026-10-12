import * as authors from '../../services/authorService';
import * as categories from '../../services/categoryService';
export type CatalogKind = 'authors' | 'categories';
export const catalogConfig = {
    authors: {
        title: 'Autores',
        singular: 'autor',
        nameLabel: 'Nome do autor',
        createLabel: 'Novo autor',
        plural: 'autores',
        base: '/admin/authors',
        description: 'Organize os autores e seus nomes cadastrados.',
        find: authors.findAuthors,
        get: authors.findAuthorById,
        names: authors.findAuthorNames,
        create: async (name: string) => [await authors.createAuthor({ name })],
        add: authors.addAuthorAlternativeName,
        primary: authors.changeAuthorPrimaryName,
        remove: authors.removeAuthorName,
        merge: (target: number, source: number) =>
            authors.mergeAuthors({
                targetAuthorId: target,
                sourceAuthorId: source,
            }),
    },
    categories: {
        title: 'Categorias',
        singular: 'categoria',
        nameLabel: 'Nome da categoria',
        createLabel: 'Nova categoria',
        plural: 'categorias',
        base: '/admin/categories',
        description: 'Organize as categorias e seus nomes cadastrados.',
        find: categories.findCategories,
        get: categories.findCategoryById,
        names: categories.findCategoryNames,
        create: (name: string) => categories.createCategories({ name }),
        add: categories.addCategoryAlternativeName,
        primary: categories.changeCategoryPrimaryName,
        remove: categories.removeCategoryName,
        merge: (target: number, source: number) =>
            categories.mergeCategories({
                targetCategoryId: target,
                sourceCategoryId: source,
            }),
    },
};
