"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteKey = exports.getDistanceFromLatLonInKm = exports.calculateDifferenceBetweenMinMax = exports.createRandomRef = exports.getRandom = exports.validateEmail = exports.randomId = exports.errorResponse = exports.successResponse = exports.handleResponse = exports.saltRounds = exports.TOKEN_SECRET = void 0;
exports.TOKEN_SECRET = "222hwhdhnnjduru838272@@$henncndbdhsjj333n33brnfn";
exports.saltRounds = 10;
const handleResponse = (res, statusCode, status, message, data) => {
    return res.status(statusCode).json({
        status,
        message,
        data,
    });
};
exports.handleResponse = handleResponse;
const successResponse = (res, message = 'Operation successfull', data) => {
    return res.status(200).json({
        status: true,
        message,
        data,
    });
};
exports.successResponse = successResponse;
const errorResponse = (res, message = 'An error occured', data) => {
    return res.status(400).json({
        status: false,
        message,
        data,
    });
};
exports.errorResponse = errorResponse;
const randomId = (length) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
};
exports.randomId = randomId;
const validateEmail = (email) => {
    return email.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
};
exports.validateEmail = validateEmail;
const getRandom = (length) => Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1));
exports.getRandom = getRandom;
const createRandomRef = (length, initial) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return `${initial}_${result}`;
};
exports.createRandomRef = createRandomRef;
function calculateDifferenceBetweenMinMax(numbers) {
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
    if (index == 0) {
        value = true;
    }
    else {
        value = false;
    }
    let percentage = ((largestNumber - smallestNumber) / smallestNumber) * 100;
    return { rate: percentage.toFixed(1), status: value };
}
exports.calculateDifferenceBetweenMinMax = calculateDifferenceBetweenMinMax;
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}
exports.getDistanceFromLatLonInKm = getDistanceFromLatLonInKm;
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
const deleteKey = (obj, path, path2) => {
    const _obj = JSON.parse(JSON.stringify(obj));
    const keys = path.split('.');
    const key2 = path2.split('.');
    keys.reduce((acc, key, index) => {
        if (index === keys.length - 1) {
            delete acc[key];
            return true;
        }
        return acc[key];
    }, _obj);
    key2.reduce((acc, key, index) => {
        if (index === keys.length - 1) {
            delete acc[key];
            return true;
        }
        return acc[key];
    }, _obj);
    return _obj;
};
exports.deleteKey = deleteKey;
//# sourceMappingURL=utility.js.map