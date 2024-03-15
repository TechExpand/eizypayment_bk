import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import config from './config/configSetup';

import { initDB } from './controllers/db';
import invoice from './routes/invoice';
import withdrawal from './routes/withdrawal';
import auth from './routes/auth';
import paymentRequest from "./routes/paymentLink";
import admin from './routes/admin/token';

import customer from "./routes/customer";
import { isAuthorized } from './middlewares/authorise';
import { request } from 'http';



const app: Application = express();

const http = require('http').Server(app);

app.use(morgan('dev'));

// PARSE JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ENABLE CORS AND START SERVER
app.use(cors({ origin: true }));
initDB();
app.listen(config.PORT, () => {
	console.log(`Server started on port ${config.PORT}`);
});



app.all('*', isAuthorized);
app.use("/api", invoice);
app.use("/api", auth);
app.use("/api", paymentRequest);
app.use("/api", admin);
app.use("/api", customer);
app.use("/api", withdrawal);







