import { AuthenticationError } from "../../errors/authentication.error.js";

export const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password";

export function createInvalidCredentialsError(): AuthenticationError {
  return new AuthenticationError(INVALID_CREDENTIALS_MESSAGE);
}
