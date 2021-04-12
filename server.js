'use strict';


require('dotenv').config();

const { query } = require('express');
// const { query } = require('express');
const express=require('express');
const superagent = require('superagent');

const PORT = process.env.PORT || 3030;
const server=express();
server.set('view engine','ejs');
server.use(express.static('./public'))
 server.use(express.urlencoded({extended:true}));

server.listen(PORT, ()=>{
    console.log(`Here is port ${PORT}`);
})

//localhost:3000/
server.get('/',(req,res)=>{

     res.render('pages/index');
})

//localhost:3000/search/new
server.get('/search/new',(req,res)=>{
  
         res.render('pages/searches/new');
    })

//localhost:3000/search
server.post('/search',(req,res)=>{
      let searchedBook=req.body.q;
      let searchBy=req.body.searchBy;
      console.log(req.body);
      let URL=`https://www.googleapis.com/books/v1/volumes?q=+in${searchBy}:${searchedBook}&maxResults=10`
         superagent.get(URL)
         .then(booksData=>{
             console.log('by title', booksData.body.items);
             let bookDataArr= booksData.body.items.map((item)=>{
                let newBook= new Books (item);
                return newBook;
                  });
 
            res.render('pages/searches/shows',{books:bookDataArr} );
         })

    //       if (req.body.title=='on'){
    //           let URL=`https://www.googleapis.com/books/v1/volumes?q=${searchedBook}+intitle:keys&maxResults=10`
    //      superagent.get(URL)
    //      .then(booksData=>{
    //          console.log('by title', booksData.body.items);
    //          let titleDataArr= booksData.body.items.map((item)=>{
    //             let titleBook= new Books (item);
    //             return titleBook;
    //               });
    
    //         res.render('pages/searches/shows',{books:titleDataArr} );
    //     }) }
    //     if (req.body.author=='on'){
    //         let URL=`https://www.googleapis.com/books/v1/volumes?q=${searchedBook}+inauthor:keys&maxResults=10`
    //    superagent.get(URL)
    //    .then(booksData=>{
    //        console.log('by author', booksData.body);
    //        res.render('pages/searches/shows',{books:titleDataArr} );
    //   })   
    //       }
       
    })


function Books(book){
 this.image=book.volumeInfo.imageLinks.thumbnail;
this.title=book.volumeInfo.title;
this.author=book.volumeInfo.authors;
this.description=book.volumeInfo.description;
}

//localhost:3000/*
server.get('*',(req,res)=>{
   
         res.render('pages/error');
    })