// Import packages
import { Router } from 'express';
import { changePassword, login, register, testApi, verifyOtp } from '../controllers/auth';
import { createInvoice, fetchAllNetwork, fetchInvoice, fetchSignleInvoice, sendInvoiceReminder, updateInvoiceStatus, webhook } from '../controllers/invoice';
import { createPaymentLink, fetchPaymenntRequest, fetchSignlePaymenntRequest } from '../controllers/paymentLink';
import { fetchFirstSixTransactions, fetchTransactions } from '../controllers/transactions';


const routes = Router();

/*************************************************************************
API CALL START
*************************************************************************/

// INDEX ROUTE TO SHOW API IS WORKING FINE.
routes.get('/user/transactions', fetchTransactions);
routes.get('/user/first-six-transactions', fetchFirstSixTransactions);
routes.get('/test', testApi);






export default routes;
