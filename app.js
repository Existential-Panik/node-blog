require('dotenv').config()

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const MongoStore = require('connect-mongo');
const session = require('express-session');
const connectDB = require('./server/config/db');

const app = express();
const PORT = 5000 || process.env.PORT;

// Conenct to DB
connectDB();

app.use(express.urlencoded({ extended: true} ));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    }),
}));

const mainRoute = require('./server/routes/main');
const adminRoute = require('./server/routes/admin');

app.use(express.static('public'));

app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

app.use('/', mainRoute);
app.use('/admin', adminRoute);

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});