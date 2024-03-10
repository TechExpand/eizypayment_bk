const axios = require("axios");
import { Resend } from 'resend';
import config from '../config/configSetup';



// const resend = new Resend(config.BREVO);
// export const sendEmailResend = async (email: String, subject: String, template: String)=>{
//   resend.emails.send({
//     from: 'app@foodtruck.express',
//     to: `${email}`,
//     subject: `${subject}`,
//     html: `${template}`
//   });
// }



export const sendEmail = async (email: String, subject: String, template: String)=>{
  const response = await axios.post(
      `https://api.brevo.com/v3/smtp/email`,
      {
        "sender":{  
          "name": "Eizy App",
          "email":"support@eizyapp.com"
       },
       "to":[  
          {  
             "email": email,
             "name": "User"
          }
       ],
       subject: `${subject}`,
       "htmlContent":  `${template}`
      },
      {
        headers: {
          "api-key": config.BREVO,
          "accept": "application/json",
          'Content-Type': ['application/json', 'application/json']
        }
      }
    );

    if (response.status <= 300) {
      return {
          status: true,
        message: response.data,
      }
    } else {
      return  {
        status: false,
        message: response.data,
      };
    }
}