// Import packages
import { Router } from 'express';
import { changePassword, getUser, login, register, sendOtp, updateUser, verifyOtp } from '../controllers/auth';
import { } from '../controllers/invoice';
import { upload } from '../helpers/upload';


const routes = Router();

/*************************************************************************
API CALL START
*************************************************************************/

// INDEX ROUTE TO SHOW API IS WORKING FINE.
routes.post('/user/login', login);
routes.post('/user/update', upload.array("image"), updateUser);
routes.post('/user/register', register);
routes.post('/user/forget', changePassword)
routes.post('/user/verify', verifyOtp)
routes.post('/user/send-otp', sendOtp);
routes.get('/user', getUser);
// routes.get('/sendemail', sendEmailTest);





export default routes;
