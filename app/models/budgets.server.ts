import { json } from "@remix-run/server-runtime";
import type { BudgetSummary, Category, MonthDetail } from "ynab";
import { API as ynabAPI } from "ynab";

export type Categories = {
  categories?: ReadonlyArray<Category>;
};

export async function getCategories(
  accessToken: string,
  budgetId: string
): Promise<Categories> {
  const ynab = new ynabAPI(accessToken);

  const categoriesData = await ynab.categories.getCategories(budgetId);
  let categories: Array<Category> = [];
  categoriesData.data.category_groups.forEach(categoryGroup => {
    categories.push(...categoryGroup.categories);
  });

  return { categories };
}

export async function getMonthData(accessToken: string, budgetId: string, month: Date | string): Promise<MonthDetail> {
  const ynab = new ynabAPI(accessToken);

  const monthDetailData = await ynab.months.getBudgetMonth(budgetId, month);

  return monthDetailData.data.month;
}

export async function getBudgets(
  accessToken: string
): Promise<BudgetSummary[]> {
  console.log(`Using token ${accessToken}`);
  const ynab = new ynabAPI(accessToken);

  const budgets = await ynab.budgets.getBudgets();
  console.log("Budgets response: " + json(budgets));

  return budgets.data.budgets;
}
