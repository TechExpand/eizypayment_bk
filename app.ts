import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import config from './config/configSetup';

import { initDB } from './controllers/db';
import invoice from './routes/invoice';
import withdrawal from './routes/withdrawal';
import auth from './routes/auth';
import paymentRequest from "./routes/paymentLink";
import crowdFund from "./routes/crowdFund";
import transactions from "./routes/transactions";
import web from "./routes/web";
import admin from './routes/admin/token';

import customer from "./routes/customer";
import { isAuthorized } from './middlewares/authorise';
import { request } from 'http';
import { Redis } from './services/redis';

const app: Application = express();

const http = require('http').Server(app);


//Socket Logic
export const socketio = require('socket.io')(http, {
	cors: {
		origin: "*"
	}
})


socketio.on("connection", async (socket: any) => {
	console.log("connetetd");
	console.log(socket.id, "has joined");

	socket.on("signin_notification", async (id: any) => {
		const redis = new Redis();
		const cachedUserSocket = await redis.setData(`notification-${id}`, socket.id);
	});


	socket.on("notification", async (data: any) => {

	});
});





app.use(morgan('dev'));

// PARSE JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ENABLE CORS AND START SERVER
app.use(cors({ origin: true }));
initDB();

http.listen(config.PORT, () => {
	console.log(`Server started on port ${config.PORT}`);
});


// set the view engine to ejs
app.set('view engine', 'ejs');


app.use(express.static(__dirname + '/public'));

// use res.render to load up an ejs view file

app.all('*', isAuthorized);
app.use("/api", invoice);
app.use("/api", auth);
app.use("/api", paymentRequest);
app.use("/api", crowdFund);
app.use("/api", admin);
app.use("/api", customer);
app.use("/api", transactions);
app.use("/api", withdrawal);
app.use("/", web);







