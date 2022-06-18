import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/session.server";

export const authenticator: Authenticator = new Authenticator(sessionStorage);