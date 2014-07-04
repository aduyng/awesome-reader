var env = process.env.NODE_ENV || 'development',
    config = require('./config')[env],
    Bookshelf = require('bookshelf');

var conn;
if (Bookshelf.conn) {
    conn = Bookshelf.conn;
} else {
    Bookshelf.conn = conn = Bookshelf.initialize(config.db);
}
module.exports = conn;


