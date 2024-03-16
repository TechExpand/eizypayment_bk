// Import packages
import { Sequelize } from 'sequelize-typescript';

// Import configs
import config from '../config/configSetup';
import { Users } from '../models/Users';
import { Verify } from '../models/Verify';
import { Tokens } from '../models/Token';
import { Customers } from '../models/Customers';
import { Invoice } from '../models/Invoice';
import { UserTokens } from '../models/UserToken';
import { Withdrawal } from '../models/Withdrawal';
import { PaymentRequests } from '../models/Payment';



// // Import models
// import {


// } from './models';


const sequelize = new Sequelize(config.DBNAME, config.DBUSERNAME, config.DBPASSWORD, {
	host: config.DBHOST,
	port: config.DBPORT,
	dialect: 'mysql',
	logging: false,
	// dialectOptions: {
	// 	ssl: { require: true, rejectUnauthorized: false },
	// },
	ssl: false,
	models: [
		Users,
		Verify,
		Tokens,
		UserTokens,
		Customers,
		PaymentRequests,
		Invoice,
		Withdrawal
	],
});

const initDB = async () => {
	await sequelize.authenticate();
	await sequelize
		// .sync({})
		.sync({ alter: true })
		.then(async () => {
			console.log('Database connected!');
		})
		.catch(function (err: any) {
			console.log(err, 'Something went wrong with the Database Update!');
		});
};
export { sequelize, initDB };
