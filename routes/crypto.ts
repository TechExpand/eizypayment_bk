// Import packages
import { Router } from 'express';
import { changePassword, login, register, testApi, verifyOtp } from '../controllers/auth';
import { createInvoice, fetchInvoice, fetchSignleInvoice } from '../controllers/invoice';
import { createCustomer, deleteCustomer, fetchCustomer } from '../controllers/customer';
import { createAddress } from '../controllers/crypto';


const routes = Router();

/*************************************************************************
API CALL START
*************************************************************************/

// INDEX ROUTE TO SHOW API IS WORKING FINE.
routes.post('/user/address', createAddress);







export default routes;
