// Import packages
import { Router } from 'express';
import { changePassword, getUser, login, register, sendOtp, updateUser, verifyOtp } from '../../controllers/auth';
import { createFunding, createToken, deleteToken, fetchPrices, fetchTokens } from '../../controllers/admin/token';


const routes = Router();

/*************************************************************************
API CALL START
*************************************************************************/

// INDEX ROUTE TO SHOW API IS WORKING FINE.
routes.post('/admin/token', createToken);
routes.delete('/admin/token/:id', deleteToken);
routes.get('/admin/token', fetchTokens);
routes.get('/admin/price', fetchPrices);
routes.post('/admin/create-funding', createFunding)
// routes.get('/sendemail', sendEmailTest);



export default routes;
