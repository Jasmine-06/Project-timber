interface IUserCreateSchema {
    name: string,
    username: string,
    email: string,
    password: string,
    verification_code?: string,
    verification_code_expiry?: Date,
    is_verified?: boolean,
    bio?: string,
    interests?: string[],
};