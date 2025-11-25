import mongoose from "mongoose";
import { DB_NAME } from "../constants";

export async function connectManagedDb() {
    Promise.resolve(
        mongoose.connect(`${process.env.DATABASE_URL}/${DB_NAME}`,{})
    ).then((data) => {
        console.log("Connected to MongoDB Successfully" + data.connection.host);
        console.log("Database Name: " + data.connection.name);
    }).catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1)
    });
}