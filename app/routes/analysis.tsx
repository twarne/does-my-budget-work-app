import { Form, Outlet, useLoaderData } from "@remix-run/react";
import {
  ActionFunction,
  json,
  LoaderFunction,
} from "@remix-run/server-runtime";
import type { BudgetSummary } from "ynab";
import { getBudgets } from "~/models/budgets.server";
import { requireAccessToken, updateSessionWithBudget } from "~/session.server";
import { safeRedirect } from "~/utils";

interface LoaderData {
  budgets: ReadonlyArray<BudgetSummary>;
}

interface ActionData {
  error?: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  const accessToken = await requireAccessToken(request);
  const budgets = await getBudgets(accessToken);

  return { budgets };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const budgetIdData = formData.get("budget")?.toString();

  if (!budgetIdData) {
    return json<ActionData>(
      {
        error: "Budget id must be specified",
      },
      { status: 400 }
    );
  }

  const budgetId = budgetIdData;
  const redirectTo = safeRedirect(formData.get("redirectTo"), `/analysis/${budgetId}`);

  return updateSessionWithBudget({ request, budgetId, redirectTo });
};

export default function Analysis() {
  const data = useLoaderData() as LoaderData;

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <div className="mx-auto w-full max-w-md px-8">
          {data.budgets.length === 0 ? (
            <p>No budgets found!</p>
          ) : (
            <div className="flex flex-col items-center">
              <Form method="post" className="space-y-6">
                <label className="block text-sm font-medium">
                  Select budget:
                </label>
                <select name="budget" className="text-gray-700">
                  {data.budgets.map((budget) => (
                    <option key={budget.id} value={budget.id}>
                      {budget.name} (Last modified on {budget.last_modified_on})
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="w-full rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
                >
                  Select budget
                </button>
              </Form>
            </div>
          )}
        </div>
      </header>
      <main>
        <div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
