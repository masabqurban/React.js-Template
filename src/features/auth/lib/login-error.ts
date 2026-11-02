import { isApiError } from "@/lib/api";

/** Maps API error codes to messages a person can act on. */
export function loginErrorMessage(error: unknown): string {
  if (!isApiError(error)) return "Something went wrong. Please try again.";
  switch (error.code) {
    case "INVALID_CREDENTIALS":
      return "Incorrect email or password.";
    case "ACCOUNT_INACTIVE":
      return "This account is not active. Contact an administrator.";
    case "NETWORK_ERROR":
    case "TIMEOUT":
      return "Can't reach the server. Check your connection and try again.";
    case "NOT_CONFIGURED":
      return "The API URL is not configured. Set VITE_API_URL or enable mocks.";
    default:
      return error.message;
  }
}
