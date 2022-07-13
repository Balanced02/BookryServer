import express, { Application, Request, Response } from 'express';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import session from 'express-session';
import dotenv from 'dotenv';
import router from './routes/v1';
import connectDb from './config/connectDb';
import './environment';

dotenv.config();
const app: Application = express();

Sentry.init({
  dsn: `https://${process.env.sentryKey}.sentry.io/5791935`,
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

app.use('/api/v1', router);

app.use(Sentry.Handlers.errorHandler());

app.use('*', (req: Request, res: Response) => {
  res.status(400).json({ message: 'not_found_exception' });
});

const PORT = process.env.PORT || 8000;

// eslint-disable-next-line no-console
app.listen(PORT, () => console.log(`Bookry Running on port ${PORT}`));
