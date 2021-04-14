'use strict';


require('dotenv').config();

const { query } = require('express');
const express=require('express');
const superagent = require('superagent');
const pg=require('pg');
const methodOverride = require('method-override');
const PORT = process.env.PORT || 3030;

const server=express();
server.set('view engine','ejs');
server.use(express.static('./public'))
 server.use(express.urlencoded({extended:true}));
// const path = require( 'path' );
// server.set( 'views', path.join( __dirname, '/views/pages' ) );
// server.set( 'view engine','ejs' );
server.use(methodOverride('_method'));

const client = new pg.Client({
     connectionString: process.env.DATABASE_URL,
     ssl: process.env.DEV_MODE ? false : { rejectUnauthorized: false },
   });

client.connect()
.then(()=>{
     server.listen(PORT, ()=>{
          console.log(`Here is port ${PORT}`);
      })

})
.catch((err)=>{
     console.log(err);
})


//localhost:3000/
server.get('/',(req,res)=>{
let SQL=`SELECT * FROM books;`;
client.query(SQL)
.then((results=>{
     // console.log(results.rows);
      res.render('pages/index',{booksResults:results.rows})
     
}))
    
})

//localhost:3000/searches/new
server.get('/searches/new',(req,res)=>{
  
         res.render('pages/searches/new');
    });

    server.get('/books/:bookID',(req,res)=>{
     console.log(req.params);
     let SQL = `SELECT * FROM books WHERE id=$1;`;
      let safeValue = [req.params.bookID]
     client.query(SQL,safeValue)
     .then(results=>{
      res.render('pages/books/show',{booksResults:results.rows})
  
});
    });

server.post('/books',(req,res)=>{

console.log('form', req.body); 
let { author, title, isbn, image_url, description}=req.body;

let SQL=`INSERT INTO books (author, title, isbn, image_url, description) VALUES ($1,$2,$3,$4,$5) RETURNING *;`;
let safeValues=[ author, title, isbn, image_url, description];
client.query(SQL, safeValues)
.then(results=>{
     console.log(results.rows)
     res.redirect(`/books/${results.rows[0].id}`)
})
// res.send('dddddd')
    });

//localhost:3000/searches
server.post('/searches',(req,res)=>{
      let searchedBook=req.body.q;
      let searchBy=req.body.searchBy;
      console.log(req.body);
      let URL=`https://www.googleapis.com/books/v1/volumes?q=+in${searchBy}:${searchedBook}&maxResults=10`
         superagent.get(URL)
         .then(booksData=>{
          //     console.log('by title', booksData.body.items);
             let bookDataArr= booksData.body.items.map((item)=>{
                let newBook= new Books (item);
                return newBook;
                  });
          // let x=booksData.body.items;
          console.log('by title', booksData.body.items);
//   res.send(bookDataArr)
             res.render('pages/searches/shows',{booksResults:bookDataArr} );
         })
.catch(error=>{
     res.render('pages/error',{error:err})
})
       
    })


function Books(book){
 this.image_url=(book.volumeInfo.imageLinks)?book.volumeInfo.imageLinks.thumbnail:"https://i.imgur.com/J5LVHEL.jpg";
this.title=book.volumeInfo.title;
this.author=(book.volumeInfo.authors)? book.volumeInfo.authors.join(', '): 'No author data for this book';
this.description=(book.volumeInfo.description)?book.volumeInfo.description:'No description data for this book';
this.isbn=(book.volumeInfo.industryIdentifiers)?book.volumeInfo.industryIdentifiers[0].identifier:'No ISBN data for this book';
// this.bookshelf= (book.volumeInfo.industryIdentifiers)?book.volumeInfo.industryIdentifiers.toString().join(','):'No ISBN data for this book';
}

//localhost:3000/*
server.get('*',(req,res)=>{
   
         res.render('pages/error');
    })