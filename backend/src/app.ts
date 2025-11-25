import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors(
    {
        origin: "http://localhost:3000",
        credentials: true
    }
));

app.use(express.json(
    {
        limit: "30kb"
    }
));

app.use(cookieParser());

app.use(express.urlencoded({ 
    extended: true 
}));

app.use(express.static("public"));


export default app;