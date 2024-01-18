const exceljs = require('exceljs');

class BookModel {
    static async readExcelData(filePath) {
        const workbook = new exceljs.Workbook();

        try {
            await workbook.xlsx.readFile(filePath);
            const worksheet = workbook.getWorksheet(1);

            const books = [];

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
                    books.push(book);
                }
            });

            return books;
        } catch (error) {
            console.error('Error reading Excel file:', error.message);
            throw error;
        }
    }

    // static async readAuthorsData(filePath) {
    //     const workbook = new exceljs.Workbook();
    //
    //     try {
    //         await workbook.xlsx.readFile(filePath);
    //         const worksheet = workbook.getWorksheet(1);
    //
    //         const authors = {};
    //
    //         worksheet.eachRow((row, rowNumber) => {
    //             if (rowNumber !== 1) {
    //                 const book = {
    //                     ID: row.getCell(1).value,
    //                     Name: row.getCell(2).value,
    //                     Author: row.getCell(3).value,
    //                     PublishYear: row.getCell(4).value,
    //                     PagesCount: row.getCell(5).value,
    //                     Price: row.getCell(6).value,
    //                 };
    //
    //                 if (!authors[book.Author]) {
    //                     authors[book.Author] = { name: book.Author, books: [] };
    //                 }
    //
    //                 // Check if the book with the same ID is already in the author's books
    //                 const existingBook = authors[book.Author].books.find(b => b.ID === book.ID);
    //                 if (!existingBook) {
    //                     authors[book.Author].books.push(book);
    //                 }
    //             }
    //         });
    //
    //         return Object.values(authors);
    //     } catch (error) {
    //         console.error('Error reading Excel file:', error.message);
    //         throw error;
    //     }
    // }

    static async writeExcelData(filePath, data) {
        const workbook = new exceljs.Workbook();
        const worksheetName = 'Books';

        // Add header row
        const headerRow = ['ID', 'Name', 'Author', 'Publish Year', 'Pages Count', 'Price'];

        // Add data rows
        const dataRows = data.map(book => [
            parseInt(book.ID, 10) || 0, // Convert ID to number
            book.Name,
            book.Author,
            book.PublishYear,
            book.PagesCount,
            book.Price,
        ]);

        // Combine header and data rows
        const allRows = [headerRow, ...dataRows];

        // Create a new worksheet with the combined rows
        const worksheet = workbook.addWorksheet(worksheetName, {
            views: [{ state: 'frozen', ySplit: 1 }],
        });

        worksheet.addRows(allRows);

        // Write the updated data back to the Excel file
        await workbook.xlsx.writeFile(filePath);
        console.log('Excel file written successfully.');
    }

    static async generateNewId(filePath) {
        const existingData = await this.readExcelData(filePath);
        const lastId = Math.max(...existingData.map(book => parseInt(book.ID, 10) || 0), 0);
        return (lastId + 1).toString();
    }

    static async createBook(newBook, filePath) {
        // Generate a new ID for the book
        newBook.ID = await this.generateNewId(filePath);

        // Read existing data from the Excel file
        const existingData = await this.readExcelData(filePath);

        // Add the new book to the existing data
        existingData.push(newBook);

        // Write the updated data back to the Excel file
        await this.writeExcelData(filePath, existingData);

        return newBook;
    }

}

module.exports = BookModel;
