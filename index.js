const express = require('express');
const cors = require('cors');
const { connect } = require("mongoose");
require("dotenv").config();
const upload = require("express-fileupload")

const userRoutes = require("./Routes/userRoutes"); 
const postRoutes = require("./Routes/postRoutes");
const port = process.env.PORT || 8000;
const {notFound,errorHandler} = require("./middleweres/errorMiddle")

const app = express();
app.use(express.json());
const corsOptions = {
    origin: 'http://localhost:5173', // Replace with your frontend URL
    credentials: true // Enable credentials
};

app.use(cors(corsOptions));

  
app.use("/user", userRoutes);
app.use("/posts", postRoutes);
app.use(notFound);
app.use(errorHandler);
app.use(upload());
app.use('/uploads',express.static(__dirname+'/uploads'))

connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });

