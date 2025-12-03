import mongoose from "mongoose";
import { DB_NAME } from "../constants";
import logger from "../utils/logger";

export async function connectManagedDb() {
  Promise.resolve(
    mongoose.connect(`${process.env.DATABASE_URL}/${DB_NAME}`, {})
  )
    .then((data) => {
      logger.info(`Connected to MongoDB Successfully: ${data.connection.host}`);
      logger.info(`Database Name: ${data.connection.name}`);
    })
    .catch((err) => {
      logger.error("Error connecting to MongoDB:", err);
      process.exit(1);
    });
}
