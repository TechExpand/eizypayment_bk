"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
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
    filename: (req, file, cb) => {
        let filename = Date.now() + "--" + file.originalname;
        cb(null, filename.replace(/\s+/g, ''));
    }
});
exports.upload = multer({
    storage: imageStorage,
});
//# sourceMappingURL=upload.js.map