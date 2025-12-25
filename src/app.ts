import './config/datadog';

import express from "express";
import tracer from 'dd-trace';
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import review from './routes/review-route'

dotenv.config();

const RATE_TIME_LIMIT = Number(process.env.RATE_TIME_LIMIT) || 15;
const RATE_REQUEST_LIMIT = Number(process.env.RATE_REQUEST_LIMIT) || 100;

export const app = express();

app.get('/health', (req, res) => {
    const span = tracer.scope().active();
    span?.setTag('healthcheck', true);
    res.send('ok');
});

app.use(express.json());

app.use(morgan("dev"));

app.use(
  rateLimit({
    windowMs: RATE_TIME_LIMIT * 60 * 1000,
    max: RATE_REQUEST_LIMIT,
  }),
);

app.use(cors());

app.use(helmet());

app.use(hpp());

app.use("/api", review);

export default app;
