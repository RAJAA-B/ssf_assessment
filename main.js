//load any required libraries/modules
const express = require('express');

const mysql = require('mysql');

const hbs = require('express-handlebars');

//const SQL_SELECT_GAME = 'select * from game where name like "%samurai%" ';
const SQL_SELECT_GAME = 'select * from game where name like ?';

//const SQL_SELECT_GAME = 'select * from game limit 10';


//declare tunables
const PORT = 3000;

const pool = mysql.createPool(require('./config.json'));


//create an instance of express application
const app = express();

//Configure handlebars
app.engine('hbs', hbs());
app.set('view engine', 'hbs');
//This is optional because views is the default directory
app.set('views', __dirname + '/views');

//Routes
app.get('/search', (req, resp) => {
    const q = req.query.q;
    console.log('q: ', q);
    //Checkout a connection from the pool
    pool.getConnection((err, conn) => {
        if (err) {
            resp.status(500);
            resp.type('text/plain');
            resp.send(err);
            return;
        }
        //Perform our query
        conn.query(SQL_SELECT_GAME,
            [ `%${q}%` ],
            (err, result) => {
            //Release the connection
                conn.release();
                console.info(result);
                console.info(result[1]);
                if (err) {
                    resp.status(500);
                    resp.type('text/plain');
                    resp.send(err);
                    return;
                }
                resp.status(200);
                resp.type('text/html');
                resp.render('games', { 
                    games: result, 
                    q: q,
                    layout: false 
                });
            }
        )
    });
})

app.get(/.*/, express.static(__dirname + '/public'))

//start the server, listen on port 3000
app.listen(PORT, () => {
    console.info(`Application started on port ${PORT} at ${new Date()}`);
} );