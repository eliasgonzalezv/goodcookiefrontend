/**
 * Represents the information that will be sent to the backend
 * to perform a user registration.*/
export interface RegisterRequestPayload{
    username: string;
    password: string;
    email: string;
}