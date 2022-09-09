import { Category } from "ynab";

export interface CategorySummary {
    categoryId: string,
    name: string,
    budgeted: number,
    assigned: number,
    actual: number
}

const summarizeCategory = function (category: Category): CategorySummary {
    return {
        categoryId: category.id,
        name: category.name,
        budgeted: category.budgeted,
        assigned: category.activity + category.balance,
        actual: category.activity
    };
}

export function processCategories(categories: ReadonlyArray<Category>) : CategorySummary[]{
    return categories.map(summarizeCategory);
}