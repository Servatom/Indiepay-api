import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import {
  projectRoutes,
  sdkRoutes,
  transactionRoutes,
  userRoutes,
} from "./api/routes";
import { CustomError } from "./utils/types";

const app = express();

app.use(morgan("dev")); // middleware for logging requests
app.use(bodyParser.urlencoded({ extended: false })); // middleware for parsing body of requests
app.use(bodyParser.json());
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*"); // Handling CORS
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

const apiVersion = process.env.API_VERSION || "/v1";

app.get("/health", (req: Request, res: Response, next: NextFunction) => {
  res.send("Up and Running!");
});
app.use(apiVersion + "/user", userRoutes);
app.use(apiVersion + "/project", projectRoutes);
app.use(apiVersion + "/transaction", transactionRoutes);
app.use(apiVersion + "/sdk", sdkRoutes);

app.post(apiVersion + "/webhookTest", (req: Request, res: Response) => {
  console.log(req.body);

  res.status(200).json({
    message: "Webhook received",
  });
});

// Error handling
app.use((req: Request, res: Response, next: NextFunction) => {
  const error: CustomError = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use(
  (error: CustomError, req: Request, res: Response, next: NextFunction) => {
    res.status(error.status || 500);
    res.json({
      error: {
        message: error.message,
      },
    });
  }
);

export default app;
