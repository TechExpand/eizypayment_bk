import { NextFunction, Request, Response } from 'express';
import config from '../config/configSetup';
import moment from 'moment';

export const TOKEN_SECRET = "222hwhdhnnjduru838272@@$henncndbdhsjj333n33brnfn";
export const saltRounds = 10;


export const handleResponse = (res: any, statusCode: number, status: boolean, message: string, data?: any) => {
	return res.status(statusCode).json({
		status,
		message,
		data,
	});
};

export const successResponse = (res: any, message: string = 'Operation successfull', data?: any) => {
	return res.status(200).json({
		status: true,
		message,
		data,
	});
};


export const successFalseResponse = (res: any, message: string = 'Operation successfull', data?: any) => {
	return res.status(200).json({
		status: false,
		message,
		data,
	});
};

export const errorResponse = (res: any, message: string = 'An error occured', data?: any) => {
	return res.status(400).json({
		status: false,
		message,
		data,
	});
};




export const randomId  = (length:number)=>{
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    return result;
  }



  export const validateEmail = (email: string) => {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  };

  
  export const getRandom = (length: number) => Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1));



  export const createRandomRef = (length: number, initial:string) => {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return `${initial}_${result}`;
}



export function calculateDifferenceBetweenMinMax(numbers:any) {
	if (!Array.isArray(numbers) || numbers.length === 0) {
	  return undefined;
	}
  
	let smallestNumber = numbers[0];
	let largestNumber = numbers[0];
  
	for (let i = 1; i < numbers.length; i++) {
	  if (numbers[i] < smallestNumber) {
		smallestNumber = numbers[i];
	  }
  
	  if (numbers[i] > largestNumber) {
		largestNumber = numbers[i];
	  }
	}
  
  let value;
  const index = numbers.indexOf(largestNumber);
  if(index == 0){
	  value = true;
  }else{
	  value = false;
  }
  
  let percentage = ((largestNumber - smallestNumber) / smallestNumber) * 100
	return {rate: percentage.toFixed(1), status:value};
  }


  export function getDistanceFromLatLonInKm (lat1:any, lon1:any, lat2:any, lon2:any) {
	var R = 6371; // Radius of the earth in km
	var dLat = deg2rad(lat2-lat1);  // deg2rad below
	var dLon = deg2rad(lon2-lon1); 
	var a = 
	  Math.sin(dLat/2) * Math.sin(dLat/2) +
	  Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
	  Math.sin(dLon/2) * Math.sin(dLon/2)
	  ; 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c; // Distance in km
	return d;
  }
  
  function deg2rad(deg:any) {
	return deg * (Math.PI/180)
  }


  export const deleteKey = (obj:any, path:any, path2:any) => {
	const _obj = JSON.parse(JSON.stringify(obj));
	const keys = path.split('.');
	const key2 = path2.split('.');
  
	keys.reduce((acc:any, key:any, index:any) => {
		if (index === keys.length - 1) {
			delete acc[key];
			return true;
		}
		return acc[key];
	}, _obj);
  
  
	key2.reduce((acc:any, key:any, index:any) => {
	  if (index === keys.length - 1) {
		  delete acc[key];
		  return true;
	  }
	  return acc[key];
  }, _obj);
  
	return _obj;
  }