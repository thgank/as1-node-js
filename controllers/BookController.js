const express = require('express');
const bodyParser = require('body-parser');
const BookModel = require('../models/BookModel');
const { validateName, validateAuthor, validatePublishYear, validatePagesCount, validatePrice } = require('../utils/validationUtils');

const router = express.Router();
router.use(bodyParser.json());

// Example data (you may want to use a database in a real-world scenario)
let books = [];
let authors = [];

// Create a new book
router.post('/books/add', async (req, res) => {
    try {
        const newBook = req.body;

        // Validate the incoming data
        // (You can customize validation based on your requirements)
        if (!validateName(newBook.Name) || !validateAuthor(newBook.Author) ||
            !validatePublishYear(newBook.PublishYear) || !validatePagesCount(newBook.PagesCount) ||
            !validatePrice(newBook.Price)) {
            return res.status(400).json({ error: 'Invalid data format' });
        }

        // Create a new book using the BookModel and pass the books array and file path
        const createdBook = await BookModel.createBook(newBook, 'dummy_books.xlsx');


        return res.status(201).json(createdBook);
    } catch (error) {
        console.error('Error creating book:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// router.get('/authors', async (req, res) => {
//     try {
//         // Read data from the Excel file
//         authors = await BookModel.readAuthorsData('dummy_books.xlsx');
//         return res.status(200).json(authors);
//     } catch (error) {
//         console.error('Error reading authors:', error.message);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// Read all books
// router.get('/books', async (req, res) => {
//     try {
//         // Read data from the Excel file
//         books = await BookModel.readExcelData('dummy_books.xlsx');
//         return res.status(200).json(books);
//     } catch (error) {
//         console.error('Error reading books:', error.message);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

router.get('/books', async (req, res) => {
    try {
        // Read data from the Excel file
        books = await BookModel.readExcelData('dummy_books.xlsx');

        // Apply filters based on query parameters
        let filteredBooks = [...books];

        if (req.query.minPrice) {
            const minPrice = parseFloat(req.query.minPrice);
            filteredBooks = filteredBooks.filter(book => book.Price >= minPrice);
        }

        if (req.query.maxPrice) {
            const maxPrice = parseFloat(req.query.maxPrice);
            filteredBooks = filteredBooks.filter(book => book.Price <= maxPrice);
        }

        // Apply sorting based on query parameters
        if (req.query.sortBy) {
            const sortBy = req.query.sortBy.toLowerCase();
            if (sortBy === 'price') {
                if (req.query.sortOrder === 'asc') {
                    filteredBooks.sort((a, b) => a.Price - b.Price);
                } else if (req.query.sortOrder === 'desc') {
                    filteredBooks.sort((a, b) => b.Price - a.Price);
                }
            }
            // Add more sorting options as needed
        }

        if (req.query.search) {
            const searchTerm = req.query.search.toLowerCase();
            filteredBooks = filteredBooks.filter(book => book.Name.toLowerCase().includes(searchTerm));
        }

        return res.status(200).json(filteredBooks);
    } catch (error) {
        console.error('Error reading books:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/books/:id', async (req, res) => {
    try {
        const bookId = parseInt(req.params.id);

        // Read data from the Excel file
        const books = await BookModel.readExcelData('dummy_books.xlsx');

        const book = books.find(book => book.ID === bookId);

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        return res.status(200).json(book);
    } catch (error) {
        console.error('Error getting book by ID:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/books/update/:id', async (req, res) => {
    books = await BookModel.readExcelData('dummy_books.xlsx');
    try {
        const bookId = parseInt(req.params.id);
        const updatedBookData = req.body;

        // Find the book by ID
        const bookToUpdate = books.find(book => book.ID === bookId);
        if (!bookToUpdate) {
            return res.status(404).json({ error: 'Book not found' });
        }

        // Validate the incoming data
        // (You can customize validation based on your requirements)
        if (!validateName(updatedBookData.Name) || !validateAuthor(updatedBookData.Author) ||
            !validatePublishYear(updatedBookData.PublishYear) || !validatePagesCount(updatedBookData.PagesCount) ||
            !validatePrice(updatedBookData.Price)) {
            return res.status(400).json({ error: 'Invalid data format' });
        }

        // Update the book data
        Object.assign(bookToUpdate, updatedBookData);

        // Optionally, you can also write the updated data to the Excel file
        await BookModel.writeExcelData('dummy_books.xlsx', books);

        return res.status(200).json(bookToUpdate);
    } catch (error) {
        console.error('Error updating book:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete a book by ID
router.delete('/books/delete/:id', async (req, res) => {
    books = await BookModel.readExcelData('dummy_books.xlsx');
    try {
        const bookId = parseInt(req.params.id);

        console.log('Deleting book with ID:', bookId);

        // Find the index of the book to delete
        const bookIndex = books.findIndex(book => parseInt(book.ID) === bookId);
        console.log('Book index to delete:', bookIndex);

        if (bookIndex === -1) {
            return res.status(404).json({ error: 'Book not found' });
        }

        // Remove the book from the list
        books.splice(bookIndex, 1);


        // Optionally, you can also write the updated data to the Excel file
        // Comment out this line and check if the deletion works without writing
        await BookModel.writeExcelData('dummy_books.xlsx', books);

        return res.status(204).send();
    } catch (error) {
        console.error('Error deleting book:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
