import express, { Application } from "express";
import dotenv from "dotenv";
import { router } from "@routes";
import { ErrorHandlerMiddleware } from "@middlewares";

dotenv.config();
const app: Application = express();
app.use(express.json());


app.use("/api/v1", router);

app.use("*", ErrorHandlerMiddleware.errorHandlerMiddleware);

const PORT = process.env.APPLICATION_PORT || 7000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
