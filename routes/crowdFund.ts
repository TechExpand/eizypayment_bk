// Import packages
import { Router } from 'express';
import { changePassword, login, register, testApi, verifyOtp } from '../controllers/auth';
import { createInvoice, fetchAllNetwork, fetchInvoice, fetchSignleInvoice, sendInvoiceReminder, updateInvoiceStatus, webhook } from '../controllers/invoice';
import { createPaymentLink, fetchPaymenntRequest, fetchSignlePaymenntRequest } from '../controllers/paymentLink';
import { createCrowdFund, fetchCrowdFund, fetchSignleCrowdFund } from '../controllers/crowdFund';


const routes = Router();

/*************************************************************************
API CALL START
*************************************************************************/

// INDEX ROUTE TO SHOW API IS WORKING FINE.
routes.post('/user/crowdfund', createCrowdFund);
routes.get('/user/crowdfund', fetchCrowdFund);
routes.get('/user/crowdfund/:id', fetchSignleCrowdFund);

routes.get('/test', testApi);






export default routes;
