import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/error.middleware";
import authRouter from "./routes/auth.route";
import userRouter from "./routes/user.route";



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

// Routes 
app.use('/api/v1/auth',authRouter);
app.use('/api/v1/user',userRouter);



app.use(errorMiddleware);

export default app;