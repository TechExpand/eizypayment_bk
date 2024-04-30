const multer = require('multer');
const cloudinary = require("cloudinary").v2;
const fs = require("fs");


// cloudinary configuration
cloudinary.config({
	cloud_name: 'dxjxl1rsy',
	api_key: '524434749391688',
	api_secret: '7iooRqHMBjdWk8kY-HaQdAS6lhI'
});



const imageStorage = multer.diskStorage({


	destination: './image',
	filename: (req: any, file: any, cb: any) => {
		let filename = Date.now() + "--" + file.originalname;
		cb(null, filename.replace(/\s+/g, ''))
	}
});



export const upload = multer({
	storage: imageStorage,
}) 
