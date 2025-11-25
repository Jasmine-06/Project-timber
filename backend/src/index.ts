import app from "./app";
import "dotenv/config";
import { connectManagedDb } from "./db/db";

const PORT = process.env.PORT || 5000;

connectManagedDb()
.then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        console.log('Environment:', process.env.NODE_ENV || 'development');
    })
})
.catch((err) => {
    console.error("Failed to connect to the database:", err);
    process.exit(1);
});
