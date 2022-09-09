import { Form, useActionData, useSearchParams } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/server-runtime";
import React from "react";
import { createAccessTokenSession } from "~/session.server";
import { safeRedirect } from "~/utils";
import { json, redirect } from "@remix-run/node";

interface ActionData {
  error?: string;
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const accessTokenData = formData.get("accessToken")?.toString();
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/budget");

  if (!accessTokenData) {
    return json<ActionData>(
      {
        error: "Please enter an access token",
      },
      { status: 400 }
    );
  }

  const accessToken = accessTokenData;

  return createAccessTokenSession({ request, accessToken, redirectTo });
};

export default function AccessToken() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData() as ActionData;
  const accessTokenRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Form method="post" className="space-y-6">
          <label
            htmlFor="accessToken"
            className="block text-sm font-medium text-gray-700"
          >
            Enter your personal access token:
          </label>
          {actionData?.error && (
            <div className="pt-1 text-red-700" id="access-token-error">
              {actionData.error}
            </div>
          )}
          <div className="mt-1">
            <input
              ref={accessTokenRef}
              id="accessToken"
              required
              autoFocus={true}
              name="accessToken"
              className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
            ></input>
          </div>
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <button
            type="submit"
            className="w-full rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Submit Access Token
          </button>
        </Form>
      </div>
    </div>
  );
}
