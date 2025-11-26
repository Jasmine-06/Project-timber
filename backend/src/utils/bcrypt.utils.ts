import bcrypt from "bcryptjs";

export const hashedPasswords = async (password : string) => {
    const hashPassword = await bcrypt.hash(password, 10)
    return hashPassword;
};


export const comparePassword = async (password : string, hashPassword: string) : Promise<Boolean>  => {
    const isPasswordCorrect = await bcrypt.compare(password, hashPassword)
    return isPasswordCorrect;
};
