const express = require('express');
const BookController = require('./controllers/BookController');
const AuthorController = require('./controllers/AuthorController')
const xlsxController = require('./controllers/xlsxController')


const app = express();
const PORT = process.env.PORT || 8080;

// api route
app.use('/api', BookController, AuthorController, xlsxController);


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
