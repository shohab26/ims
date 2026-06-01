const express = require('express');
const connection = require('../connection');

class Book{
    constructor(name, price, dept_id) {
        this.name = name;
        this.price = price;
    }

    //get by id request
    static getById(id, callback) {
        var query = "select * from book where id=?";
        connection.query(query, [id], (err, results) => {
            if (err) {
                throw err;
            }
            callback(results[0]);
        });
    }
}
module.exports = Book;