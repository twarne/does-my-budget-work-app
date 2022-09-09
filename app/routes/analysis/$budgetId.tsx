import { Outlet, useLoaderData, useParams } from "@remix-run/react";
import { LoaderFunction, redirect } from "@remix-run/server-runtime";
import { getCategories } from "~/models/budgets.server";
import { requireAccessToken } from "~/session.server";
import {
  CategorySummary,
  processCategories,
} from "~/utilities/analysis.server";
import { formatAmount, safeRedirect } from "~/utils";

export const loader: LoaderFunction = async ({ request, params }) => {
  const accessToken = await requireAccessToken(request);
  const budgetId = params.budgetId || "";
  return { };
};

export default function BudgetId() {
  const params = useParams();
  redirect(`/analysis/${params.budgetId}/current`);

  return (
    <div className="flex flex-col">
      <Outlet/>
    </div>
  );
}
