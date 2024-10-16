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
import { Transactions } from '../models/Transaction';
import { Banks } from '../models/Bank';
import { Admin } from '../models/Admin';
import { Wallet } from '../models/Wallet';
import {Order} from '../models/Order';
import { Card } from '../models/Card';
import { Price } from '../models/Price';



const sequelize = new Sequelize(config.DBNAME, config.DBUSERNAME, config.DBPASSWORD, {
	host: config.DBHOST,
	port: config.DBPORT,
	dialect: 'mysql',
	logging: false,
	dialectOptions: {
		// ssl: { require: true, rejectUnauthorized: false },
		ssl: false
	},
	models: [
		Users,
		Verify,
		Admin,
		Price,
		Card,
		Banks,
		Tokens,
		UserTokens,
		Order,
		Wallet,
		Transactions,
		Customers,
		PaymentRequests,
		Invoice,
		Withdrawal
	],
});

const initDB = async () => {
	await sequelize.authenticate();
	await sequelize
		.sync({ alter: true })
		.then(async () => {
			console.log('Database connected!');
		})
		.catch(function (err: any) {
			console.log(err, 'Something went wrong with the Database Update!');
		});
};
export { sequelize, initDB };
