/**
 * Represents the information that will be sent to backend
 * in case of a login request
 */
export interface LoginRequestPayload{
    username: string;
    password: string;
}