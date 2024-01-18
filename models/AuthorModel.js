const exceljs = require('exceljs');

class AuthorModel {

    static async readAuthorsData(filePath) {
        const workbook = new exceljs.Workbook();

        try {
            await workbook.xlsx.readFile(filePath);
            const worksheet = workbook.getWorksheet(1);

            const authors = {};

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber !== 1) {
                    const book = {
                        ID: row.getCell(1).value,
                        Name: row.getCell(2).value,
                        Author: row.getCell(3).value,
                        PublishYear: row.getCell(4).value,
                        PagesCount: row.getCell(5).value,
                        Price: row.getCell(6).value,
                    };

                    if (!authors[book.Author]) {
                        authors[book.Author] = { name: book.Author, books: [] };
                    }

                    // Check if the book with the same ID is already in the author's books
                    const existingBook = authors[book.Author].books.find(b => b.ID === book.ID);
                    if (!existingBook) {
                        authors[book.Author].books.push(book);
                    }
                }
            });

            return Object.values(authors);
        } catch (error) {
            console.error('Error reading Excel file:', error.message);
            throw error;
        }
    }

    static async getAuthorByName(filePath, authorName) {
        const workbook = new exceljs.Workbook();

        try {
            await workbook.xlsx.readFile(filePath);
            const worksheet = workbook.getWorksheet(1);

            let author = null;

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber !== 1) {
                    const authorInfo = {
                        Name: row.getCell(3).value,
                    };

                    if (authorInfo.Name.toLowerCase() === authorName.toLowerCase()) {
                        author = {
                            ID: row.getCell(1).value,
                            Name: authorInfo.Name,
                        };
                    }
                }
            });

            return author;
        } catch (error) {
            console.error('Error reading Excel file:', error.message);
            throw error;
        }
    }

    // static async updateAuthorName(filePath, existingName, updatedName) {
    //     const workbook = new exceljs.Workbook();
    //
    //     try {
    //         await workbook.xlsx.readFile(filePath);
    //         const worksheet = workbook.getWorksheet(1);
    //
    //         // Find the author by the existing name
    //         const authorRow = worksheet.find(row => row.getCell(2).value === existingName);
    //
    //         if (authorRow) {
    //             // Update the author's name
    //             authorRow.getCell(2).value = updatedName;
    //
    //             // Save the changes to the workbook
    //             await workbook.xlsx.writeFile(filePath);
    //
    //             return { success: true, message: 'Author name updated successfully' };
    //         } else {
    //             return { success: false, message: 'Author not found' };
    //         }
    //     } catch (error) {
    //         console.error('Error updating author name:', error.message);
    //         throw error;
    //     }
    // }

}

module.exports = AuthorModel;
