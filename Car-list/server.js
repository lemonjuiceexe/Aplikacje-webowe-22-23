const express = require('express');
const path = require('path');
const hbs = require('express-handlebars');
const app = express();

app.use(express.static(path.join(__dirname, 'static')));
app.use(express.static(path.join(__dirname, "node_modules/bootstrap/dist/")));

// --- Handlebars setup ---
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({
	defaultLayout: 'main.hbs',
	partialsDir: 'views/partials',
	extname: 'hbs'
}));
app.set('view engine', 'hbs');


// --- Routing ---
app.get('/', (req, res) => {
	res.render('dashboard.hbs');
});
app.get('/list', (req, res) => {
	res.render('list.hbs');
});

// --- Server start ---
app.listen(3000, () => {
	console.log('Server is running on port 3000');
});