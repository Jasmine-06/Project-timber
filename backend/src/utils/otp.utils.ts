import logger from "./logger";

export const generateOtp = (): string => {
  logger.debug("Generating OTP");
  return String(Math.floor(Math.random() * 100000 + 900000));
};

export const generateTimeStamp = (timeInMinutes: string): Date => {
  logger.debug({ timeInMinutes }, "Generating timestamp");
  const currentDate = new Date();
  const minuteToAdd = parseInt(timeInMinutes, 10);
  currentDate.setMinutes(currentDate.getMinutes() + minuteToAdd);
  return currentDate;
};
