// Import packages
import { Router } from 'express';
import { changePassword, login, register, testApi, verifyOtp } from '../controllers/auth';
import { createPaymentLink, fetchPaymenntRequest, fetchSignlePaymenntRequest } from '../controllers/paymentLink';
import { fetchAdmin, fetchFirstSixTransactions, fetchTransactions } from '../controllers/transactions';


const routes = Router();

/*************************************************************************
API CALL START
*************************************************************************/

// INDEX ROUTE TO SHOW API IS WORKING FINE.
routes.get('/user/transactions', fetchTransactions);
routes.get('/user/admin', fetchAdmin);
routes.get('/user/first-six-transactions', fetchFirstSixTransactions);
routes.get('/test', testApi);






export default routes;
