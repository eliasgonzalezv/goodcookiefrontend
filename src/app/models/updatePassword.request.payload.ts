/**
 * Encapsulates the information sent to the backend
 * to process a reset password request
 */
export interface UpdatePasswordRequest {
  newPassword: string;
  token: string;
}
