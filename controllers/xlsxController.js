const express = require('express');
const exceljs = require('exceljs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


// Set up multer storage to upload files to the "uploads" directory
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads'); // Uploads will be stored in the 'uploads' directory
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

const router = express.Router();

let lastUploadedFilePath = '';

router.post('/upload', upload.any(), async (req, res) => {
    try {
        if (req.files.length === 0) {
            return res.status(400).send('No files were uploaded.');
        }

        const uploadedFile = req.files[0];
        lastUploadedFilePath = uploadedFile.path;

        return res.status(200).send('File uploaded successfully.');
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
});

router.get('/download', async (req, res) => {
    try {
        if (!lastUploadedFilePath) {
            return res.status(404).send('No file has been uploaded yet.');
        }

        // Read the existing workbook from the last uploaded file
        const workbook = new exceljs.Workbook();
        await workbook.xlsx.readFile(lastUploadedFilePath);

        // Create a new XLSX file name
        const newFileName = `converted-${Date.now()}.xlsx`;

        // Set the path to the "downloads" directory
        const downloadsDirectory = 'downloads';

        // Ensure the "downloads" directory exists
        if (!fs.existsSync(downloadsDirectory)) {
            fs.mkdirSync(downloadsDirectory);
        }

        // Create the full path for the new XLSX file in the "downloads" directory
        const newFilePath = path.join(downloadsDirectory, newFileName);

        // Write the workbook to the new XLSX file
        await workbook.xlsx.writeFile(newFilePath);

        // Send the newly created XLSX file to the client for download
        const fileStream = fs.createReadStream(newFilePath);
        res.setHeader('Content-Disposition', `attachment; filename=${newFileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        fileStream.pipe(res);

        // Cleanup: Remove the temporary XLSX file after streaming
        fileStream.on('close', () => {
            fs.unlinkSync(newFilePath);
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
