import { getServerSession } from "next-auth";
import { authOptions } from "./config";

/**
 * Get the server-side session.
 * Use this in Server Components and API routes.
 */
export const getServerAuthSession = () => getServerSession(authOptions);

export { authOptions };
