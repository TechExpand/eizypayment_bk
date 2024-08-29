// Import packages
import { Router } from 'express';
import { changePassword, login, register, testApi, verifyOtp } from '../controllers/auth';
import { createInvoice, fetchAllNetwork, fetchInvoice, fetchSignleInvoice, sendInvoiceReminder, updateInvoiceStatus } from '../controllers/invoice';
import { createPaymentLink, fetchPaymenntRequest, fetchSignlePaymenntRequest } from '../controllers/paymentLink';


const routes = Router();

/*************************************************************************
API CALL START
*************************************************************************/

// INDEX ROUTE TO SHOW API IS WORKING FINE.

routes.post('/user/payment', createPaymentLink);
routes.get('/user/payment', fetchPaymenntRequest);
routes.get('/user/payment/:id', fetchSignlePaymenntRequest);








export default routes;
