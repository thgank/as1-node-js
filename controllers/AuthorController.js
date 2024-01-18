const express = require('express');
const router = express.Router();
const AuthorModel = require('../models/AuthorModel');


router.get('/authors', async (req, res) => {
    try {
        const authors = await AuthorModel.readAuthorsData('dummy_books.xlsx');

        let filteredAuthors = [...authors];

        if (req.query.name) {
            const searchName = req.query.name.toLowerCase();
            filteredAuthors = filteredAuthors.filter(author => author.name.toLowerCase().includes(searchName));
        }


        return res.status(200).json(filteredAuthors);
    } catch (error) {
        console.error('Error reading authors:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// router.put('/authors/update/:name', async (req, res) => {
//     try {
//         const existingName = req.params.name;
//         const updatedName = req.body.Name;
//
//         const result = await AuthorModel.updateAuthorName('dummy_books.xlsx', existingName, updatedName);
//
//         if (result.success) {
//             return res.status(200).json({ message: 'Author name updated successfully' });
//         } else {
//             return res.status(404).json({ error: 'Author not found' });
//         }
//     } catch (error) {
//         console.error('Error updating author name:', error.message);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

module.exports = router;
