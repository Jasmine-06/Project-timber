import "dotenv/config";
import app from "./app";
import logger from "./utils/logger";
import { connectManagedDb } from "./db/db";

const PORT = process.env.PORT || 5000;

connectManagedDb()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  })
  .catch((err) => {
    logger.error("Failed to connect to the database:", err);
    process.exit(1);
  });
