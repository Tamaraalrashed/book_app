'use strict';


require('dotenv').config();

const { query } = require('express');
const express=require('express');
const superagent = require('superagent');
const pg=require('pg');

const PORT = process.env.PORT || 3030;

const server=express();
server.set('view engine','ejs');
server.use(express.static('./public'))
 server.use(express.urlencoded({extended:true}));
// const path = require( 'path' );
// server.set( 'views', path.join( __dirname, '/views/pages' ) );
// server.set( 'view engine','ejs' );


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
     console.log(results.rows);
      res.render('pages/index',{booksResults:results.rows})
     
}))
// res.send('all is good')
    
})

//localhost:3000/searches/new
server.get('/searches/new',(req,res)=>{
  
         res.render('pages/searches/new');
    })

//localhost:3000/searches
server.post('/searches',(req,res)=>{
      let searchedBook=req.body.q;
      let searchBy=req.body.searchBy;
      console.log(req.body);
      let URL=`https://www.googleapis.com/books/v1/volumes?q=+in${searchBy}:${searchedBook}&maxResults=10`
         superagent.get(URL)
         .then(booksData=>{
          //     console.log('by title', booksData.body.items);
          //    let bookDataArr= booksData.body.items.map((item)=>{
          //       let newBook= new Books (item);
          //       return newBook;
          //         });
          let x=booksData.body.items;
          console.log('by title', booksData.body.items);
 res.send(x)
          //   res.render('pages/searches/shows',{books:bookDataArr} );
         })
// .catch(error=>{
//      res.render('error',{error:err})
// })
       
    })

//     server.get('/books/:id',(req,res)=>{
//      let SQL=`SELECT * FROM books;`;
//      client.query(SQL)
//      .then((results=>{
//           console.log(results.rows);
//            res.render('pages/index',{booksResults:results.rows})
          
//      }))

function Books(book){
 this.image=(book.volumeInfo.imageLinks)?book.volumeInfo.imageLinks.thumbnail:"https://i.imgur.com/J5LVHEL.jpg";
this.title=book.volumeInfo.title;
this.author=(book.volumeInfo.authors)? book.volumeInfo.authors: 'No author data for this book';
this.description=(book.volumeInfo.description)?book.volumeInfo.description:'No description data for this book';
this.industryIdentifiers=(book.volumeInfo.industryIdentifiers)?book.volumeInfo.industryIdentifiers.toString().join(','):'No ISBN data for this book';
}

//localhost:3000/*
server.get('*',(req,res)=>{
   
         res.render('pages/error');
    })