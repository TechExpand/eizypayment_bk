const axios = require("axios");
import { Resend } from 'resend';
import config from '../config/configSetup';
import { Redis } from './redis';
import { socketio } from '../app';





export const sendEmail = async (email: String, subject: String, template: String) => {
  const response = await axios.post(
    `https://api.brevo.com/v3/smtp/email`,
    {
      "sender": {
        "name": "Eizy App",
        "email": "support@eizyapp.com"
      },
      "to": [
        {
          "email": email,
          "name": "User"
        }
      ],
      subject: `${subject}`,
      "htmlContent": `${template}`
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
    return {
      status: false,
      message: response.data,
    };
  }
}





export const sendWhatsapp = async (number: String, subject: String, template: any) => {
  const response = await axios.post(
    `https://api.brevo.com/v3/smtp/email`,
    {
      "sender": {
        "name": "Eizy App",
        "email": "support@eizyapp.com"
      },
      "to": [
        {
          "email": number,
          "name": "User"
        }
      ],
      subject: `${subject}`,
      "htmlContent": `${template}`
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
    return {
      status: false,
      message: response.data,
    };
  }
}


export const sendAppNotification = async (id: any, data: any) => {
  const redis = new Redis();
  const cachedSocket: any = await redis.getData(`notification-${id}`)
  const socket = socketio.sockets.sockets.get(cachedSocket);
  if (socket) {
    socket.emit("notification", data)
  }
}