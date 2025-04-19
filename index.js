const express = require('express');
const path = require('path'); // need this mdoule in express the read the file
const app = express();
const exphbs = require('express-handlebars'); // import handle bars
const localport = 8000;


const PORT = process.env.PORT || localport; 
app.listen(PORT,()=>console.log(`Server Is Running on ${PORT}`));