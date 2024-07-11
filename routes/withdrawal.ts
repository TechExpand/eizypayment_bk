// Import packages
import { Router } from 'express';
import { changePassword, login, register, testApi, verifyOtp } from '../controllers/auth';
import { confirmAddress, createBank, createWithdrawal, createWithdrawalCash, fetchBank, fetchWithdrawal } from '../controllers/withdrawal';


const routes = Router();

/*************************************************************************
API CALL START
*************************************************************************/

// INDEX ROUTE TO SHOW API IS WORKING FINE.

routes.post('/user/withdraw', createWithdrawal);
routes.post('/user/bank', createBank);
routes.get('/user/bank', fetchBank);
routes.post('/user/withdraw-cash', createWithdrawalCash);
routes.get('/user/withdraw', fetchWithdrawal);
routes.get('/test', testApi);
routes.get("/user/confirm-address", confirmAddress)






export default routes;
