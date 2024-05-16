// Import packages
import { Router } from 'express';
import { WithdrawTypeState, Withdrawal, WithdrawalStatus } from '../models/Withdrawal';
import { Users } from '../models/Users';
import { Tokens } from '../models/Token';
import { UserTokens } from '../models/UserToken';
import { ServiceType, TransactionStatus, TransactionType, Transactions } from '../models/Transaction';
import { createRandomRef } from '../helpers/utility';
import { sendEmail, sendFcmNotification } from '../services/notification';
import { templateEmail } from '../config/template';
import { Admin } from '../models/Admin';
import axios from 'axios';

const routes = Router();




routes.get('/buy', async function (req, res) {
    const address = ""
    const { id } = req.query
    res.render('pages/fiat-buy', { address, invoiceId:id });
});



routes.get('/sell', async function (req, res) {

    res.render('pages/fiat-sell', { invoiceId: "invoiceId" });
});


export default routes;