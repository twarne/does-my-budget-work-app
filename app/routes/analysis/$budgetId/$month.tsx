import { Outlet, useLoaderData, useParams } from "@remix-run/react";
import { LoaderFunction, redirect } from "@remix-run/server-runtime";
import { MonthDetail } from "ynab";
import { getCategories, getMonthData } from "~/models/budgets.server";
import { requireAccessToken } from "~/session.server";
import {
  CategorySummary,
  processCategories,
} from "~/utilities/analysis.server";
import { formatAmount, safeRedirect } from "~/utils";

interface LoaderData {
  monthData: MonthDetail;
  categories: CategorySummary[];
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const accessToken = await requireAccessToken(request);
  const budgetId = params.budgetId || "";
  const month = params.month ? new Date(params.month) : "current";
  console.log(`Loading data for month ${month}`);
  const monthData = await getMonthData(accessToken, budgetId, month);
  const categories = processCategories(monthData.categories || []);

  return { monthData, categories };
};

export default function Month() {
  const loaderData = useLoaderData() as LoaderData;
  const params = useParams();

  return (
    <div className="flex flex-col">
      <p>Budget: {params.budgetId}</p>
      <p>Month: {params.month}</p>
      <div>
        <div>
          <p>Total Income: {formatAmount(loaderData.monthData.income)}</p>
          <p>Total Ouflow: {formatAmount(loaderData.monthData.activity)}</p>
          <p>Total Budgeted: {formatAmount(loaderData.monthData.budgeted)}</p>
        </div>
        <table className="table-fixed border">
          <tr className="border">
            <th className="border">name</th>
            <th className="border">budgeted</th>
            <th className="border">assigned</th>
            <th className="border">actual</th>
          </tr>
          {loaderData.categories.map((category) => (
            <tr key={category.categoryId} className="border">
              <td className="border">{category.name}</td>
              <td className="border">{formatAmount(category.budgeted)}</td>
              <td className="border">{formatAmount(category.assigned)}</td>
              <td className="border">{formatAmount(category.actual)}</td>
            </tr>
          ))}
        </table>
      </div>
    </div>
  );
}
