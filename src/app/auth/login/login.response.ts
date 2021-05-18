/**
 * Represents the information obtained from the backend
 * as a response to a login request
 */
export interface LoginResponse{
    authenticationToken: string;
    refreshToken: string;
    expiresAt: Date;
    username: string;
}