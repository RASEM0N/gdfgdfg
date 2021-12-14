//#region Imports
const express = require('express');
const colors = require('colors');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');

// Middleware
const morgan = require('morgan');

//#endregion

// Load env vars
dotenv.config({ path: './config/config.env' });

const app = express();

// Connect Database
connectDB();

//#region Middleware

// JSON validator
app.use(express.json({ extended: false }));

// Dev logging middleware
app.use(cors());

app.use(morgan('dev'));

//#endregion

//#region Routes

app.use('/api/users', require('./routes/api/users'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));

//#endregion

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`.yellow.bold);
});
