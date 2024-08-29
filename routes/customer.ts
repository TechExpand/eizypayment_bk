// Import packages
import { Router } from 'express';
import { changePassword, login, register, testApi, verifyOtp } from '../controllers/auth';
import { createInvoice, fetchInvoice, fetchSignleInvoice } from '../controllers/invoice';
import { createCustomer, deleteCustomer, fetchCustomer } from '../controllers/customer';


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
routes.post('/user/customer', createCustomer);
routes.get('/user/customer', fetchCustomer);
routes.delete('/user/customer/:id', deleteCustomer);







export default routes;
