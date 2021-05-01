import express, { Application, Request, Response, NextFunction } from 'express';
import router from './routes/v1';
import bodyParser from 'body-parser';
import mongoose from "mongoose";
import dotenv from "dotenv";



const app: Application = express();

app.use(bodyParser.urlencoded ({ extended: true }));
app.use(express.json());
app.use('/api/v1', router)
app.use("*", (req: Request, res: Response) => {
    res.status(400).json({ message: "Invalid_Url" });
  });


dotenv.config({ path: __dirname + "/.env" });

const PORT = process.env.PORT || 8080;


const option = {
    socketTimeoutMS: 30000,
    keepAlive: true,
    reconnectTries: 30000,
  };
  
  mongoose
    .connect(process.env.MONGODB_URI, option)
    .then(() => {
      console.log("Database connected successfully");
    })
    .catch((err) => console.error(err));


// Routes

// Index Route
app.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.json({
        message: 'Welcome to bookry api'
    });
});




























app.listen(PORT, () => console.log('Bookry Running on port 8080'));