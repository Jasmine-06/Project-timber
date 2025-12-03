import bcrypt from "bcryptjs";
import logger from "./logger";

export const hashedPasswords = async (password: string) => {
  logger.debug("Hashing password");
  const hashPassword = await bcrypt.hash(password, 10);
  return hashPassword;
};

export const comparePassword = async (
  password: string,
  hashPassword: string
): Promise<Boolean> => {
  logger.debug("Comparing password");
  const isPasswordCorrect = await bcrypt.compare(password, hashPassword);
  return isPasswordCorrect;
};
