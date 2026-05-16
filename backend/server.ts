import "./configs/instrument.mjs";
import express, { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware } from '@clerk/express';
import clerkWebhooks from './controllers/clerk.js';
import * as Sentry from "@sentry/node";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());


app.post("/api/clerk", express.raw({ type: 'application/json' }), clerkWebhooks);

app.use(express.json());
app.use(clerkMiddleware()); // ✅ moved before routes

app.get('/', (req: Request, res: Response) => {
    res.send("Hello World!");
});

app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});
Sentry.setupExpressErrorHandler(app);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});