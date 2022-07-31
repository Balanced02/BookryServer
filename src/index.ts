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

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Credentials', 'true');
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
