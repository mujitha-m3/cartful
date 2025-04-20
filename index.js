const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
require('dotenv').config();


const app = express();

// With this middleware we can get the data from HTML form
app.use(express.urlencoded({extended: false}));

app.engine('handlebars', exphbs.engine({
    defaultLayout: 'main'
}));

app.set('view engine', 'handlebars'); 


const dbURI ='mongodb+srv://'+process.env.DBUSERNAME+':'+process.env.DBPASSWORD+'@'+process.env.CLUSTER+'.mongodb.net/'+process.env.DB+'?retryWrites=true&w=majority&appName=Cluster0';
//console.log(dbURI);


mongoose.connect(dbURI)
  .then(() => {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => console.log('Server is running on port ' + PORT));
    console.log('Connected to DB');
  })
  .catch((err) => {
    console.error('Error connecting to DB:', err);
  });
  
  app.use(express.json());
  const countryRoutes = require('./routes/countryRoute');
  app.use('/', countryRoutes);

  const userRoute = require('./routes/userRoute');
  app.use('/',userRoute);

