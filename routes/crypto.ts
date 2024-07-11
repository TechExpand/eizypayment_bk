// Import packages
import { Router } from 'express';
import { changePassword, login, register, testApi, verifyOtp } from '../controllers/auth';
import { createInvoice, fetchInvoice, fetchSignleInvoice } from '../controllers/invoice';
import { createCustomer, deleteCustomer, fetchCustomer } from '../controllers/customer';
import { cardTransaction, createAddress, createCard, fetchAllCard, fetchCard, freezeCard, sendUsdc, sendUsdt, topUpCard, unfreezeCard, userKyc, withdrawBank, withdrawCard } from '../controllers/crypto';


const routes = Router();

/*************************************************************************
API CALL START
*************************************************************************/

// INDEX ROUTE TO SHOW API IS WORKING FINE.
routes.get('/user/address', createAddress);
routes.post('/user/kyc', userKyc);
routes.post('/user/create-card', createCard)
routes.get('/user/card', fetchCard)
routes.get('/user/allcard', fetchAllCard)
routes.get('/user/card-transactions', cardTransaction)
routes.post('/user/topup-card', topUpCard)
routes.post('/user/withdraw-card', withdrawCard)
routes.post('/user/withdraw-usd', topUpCard)
routes.post('/user/freeze-card', freezeCard)
routes.post('/user/unfreeze-card', unfreezeCard)
routes.post('/user/send-usdt', sendUsdt)
routes.post('/user/send-usdc', sendUsdc)
routes.post('/user/send-usdt-bank', withdrawBank)













export default routes;
