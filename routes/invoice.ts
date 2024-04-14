// Import packages
import { Router } from 'express';
import { changePassword, login, register, testApi, verifyOtp } from '../controllers/auth';
import { createInvoice, fetchAllNetwork, fetchInvoice, fetchSignleInvoice, sendInvoiceReminder, updateInvoiceStatus, webhook } from '../controllers/invoice';


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
routes.post('/user/update-invoice', updateInvoiceStatus);
routes.post('/user/update-invoice', sendInvoiceReminder);
routes.post('/user/webhook', webhook);


routes.get('/invoice/test', testApi);






export default routes;
