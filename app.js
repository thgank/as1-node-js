const express = require('express');
const BookController = require('./controllers/BookController');
const AuthorController = require('./controllers/AuthorController')
const app = express();
const PORT = process.env.PORT || 8080;

// Use the BookController for '/api' routes
app.use('/api', BookController, AuthorController);
// app.use('/api', AuthorController);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
