import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { access } from "fs";
import invariant from "tiny-invariant";

import type { User } from "~/models/user.server";
import { getUserById } from "~/models/user.server";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

const USER_SESSION_KEY = "userId";
const ACCESS_TOKEN_KEY = "accessToken";
const BUDGET_ID_KEY = "budgetId";

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function getUserId(
  request: Request
): Promise<User["id"] | undefined> {
  const session = await getSession(request);
  const userId = session.get(USER_SESSION_KEY);
  return userId;
}

export async function getAccessToken(
  request: Request
): Promise<string | undefined> {
  const session = await getSession(request);
  const accessToken = session.get(ACCESS_TOKEN_KEY);
  return accessToken;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (userId === undefined) return null;

  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function requireAccessToken(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const accessToken = await getAccessToken(request);
  if (!accessToken) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/accessToken?${searchParams}`);
  }
  return accessToken;
}

export async function requireUser(request: Request) {
  const userId = await requireUserId(request);

  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

export async function createAccessTokenSession({
  request,
  accessToken,
  redirectTo,
}: {
  request: Request;
  accessToken: string;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set(ACCESS_TOKEN_KEY, accessToken);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: 60 * 60 * 24 * 7,
      }),
    },
  });
}

export async function updateSessionWithBudget({
  request,
  budgetId,
  redirectTo,
}: {
  request: Request;
  budgetId: string;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set(BUDGET_ID_KEY, budgetId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: 60 * 60 * 24 * 7,
      }),
    },
  });
}

export async function createUserSession({
  request,
  userId,
  remember,
  redirectTo,
}: {
  request: Request;
  userId: string;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);
  console.log("Removing session");
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
