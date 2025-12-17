import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app";
import logger from "./utils/logger";
import { connectManagedDb } from "./db/db";
import { setupSocketHandlers } from "./services/socket.service";

const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Export io for use in other services
export { io };

connectManagedDb()
  .then(async () => {
    // Setup Socket.IO handlers
    await setupSocketHandlers(io);

    httpServer.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
      logger.info(`Socket.IO server initialized`);
    });
  })
  .catch((err) => {
    logger.error("Failed to connect to the database:", err);
    process.exit(1);
  });
