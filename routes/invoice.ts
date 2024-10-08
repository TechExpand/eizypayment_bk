// Import packages
import { Router } from 'express';
import { changePassword, login, register, testApi, verifyOtp } from '../controllers/auth';
import { createInvoice, fetchAllNetwork, fetchInvoice, fetchInvoiceSummary, fetchSignleInvoice, sendInvoiceReminder, updateInvoiceStatus } from '../controllers/invoice';
import { webhook, webhookBitnom, webhookMoonPay } from '../controllers/webhook';


const routes = Router();

/*************************************************************************
API CALL START
*************************************************************************/

// INDEX ROUTE TO SHOW API IS WORKING FINE.
// routes.get('/user/country', fetchCountry);
// routes.get('/user/platform', fetchPlaforms);
// routes.get('/user/price', fetchPrice);
// routes.get('/user/number', fetchNewNumber);
// routes.get('/user/status', fetchNumberStatus);
routes.post('/user/invoice', createInvoice);
routes.get('/user/invoice', fetchInvoice);
routes.get('/user/invoice/:id', fetchSignleInvoice);
routes.get('/user/network', fetchAllNetwork);
routes.get('/user/update-invoice', updateInvoiceStatus);
routes.get('/user/invoice-reminder', sendInvoiceReminder);
routes.get('/user/summary', fetchInvoiceSummary);
routes.post('/user/webhook', webhook);
routes.post('/user/webhook-moonpay', webhookMoonPay);
routes.post('/user/webhook-bitnom', webhookBitnom);



routes.get('/invoice/test', testApi);






export default routes;
