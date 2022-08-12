import express, { Application, Request, Response } from 'express';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import session from 'express-session';
import dotenv from 'dotenv';
import cors from 'cors';
import router from './routes/v1';
import connectDb from './config/connectDb';
import './environment';

dotenv.config();
const app: Application = express();

app.use(
  cors({
    credentials: true,
    origin: '*',
  }),
);

const corsList = {
  origin: [process.env.FRONTEND_ORIGN, 'http://localhost:3000'],
  default: process.env.FRONTEND_ORIGN,
};

Sentry.init({
  dsn: process.env.sentryDNS,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Tracing.Integrations.Express({ app }),
  ],
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

app.use(
  session({
    secret: process.env.sessionSecret,
    resave: false,
    saveUninitialized: true,
  }),
);

connectDb();

app.use(express.json());

app.all('*', (req: Request, res: Response, next) => {
  const origin = corsList.origin.includes(req.headers.origin)
    ? req.headers.origin
    : corsList.default;
  res.header('Access-Control-Allow-Origin', origin);
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE',
  );
  res.header(
    'Access-Control-Allow-Headers',
    'x-access-token, Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});

app.use('/api/v1', router);

app.use(Sentry.Handlers.errorHandler());

app.use('*', (req: Request, res: Response) => {
  res.status(400).json({ message: 'not_found_exception' });
});

const PORT = process.env.PORT || 8000;

// eslint-disable-next-line no-console
app.listen(PORT, () => console.log(`Bookry Running on port ${PORT}`));
