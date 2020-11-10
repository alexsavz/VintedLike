require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const formidable = require('express-formidable');


const app = express();
app.use(formidable());

mongoose.connect(process.env.MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
  });


// Routes 

const userRoute = require('./Routes/routes');
app.use(userRoute);
const offersRoute = require('./Routes/offers');
app.use(offersRoute);

app.get("/", (req, res) => {
  res.json("Bienvenue sur l'API de Vinted");
});

app.all("*", (req, res) => {
    res.status(400).json({
      error: error.message,
    });
  });


// Connect

app.listen(process.env.PORT, console.log("CONNECTED"));