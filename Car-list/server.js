const express = require('express');
const path = require('path');
const parser = require('body-parser');
const hbs = require('express-handlebars');
const nedb = require('nedb');
const app = express();

app.use(express.static(path.join(__dirname, 'static')));
app.use(express.static(path.join(__dirname, "node_modules/bootstrap/dist/")));
app.use(parser.urlencoded({ extended: false }));

// --- Handlebars setup ---
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({
	defaultLayout: 'main.hbs',
	partialsDir: 'views/partials',
	extname: 'hbs'
}));
app.set('view engine', 'hbs');

// --- Database setup ---
const database = new nedb({
	filename: 'cars.db',
	autoload: true
});

// --- Routing ---
app.get('/', (req, res) => {
	res.render('dashboard.hbs');
});
// Form for adding a record
app.get('/add', (req, res) => {
	res.render('add.hbs');
});
// Form submission handlers
app.post('/handleAddCar', (req, res) => {
	const record = {
		insurance: req.body.insurance === undefined ? false : true,
		gas: req.body.gas === undefined ? false : true,
		damaged: req.body.damaged === undefined ? false : true,
		fourbyfour: req.body.fourbyfour === undefined ? false : true
	};
	database.insert(record, (error, newDoc) => {
		if (error){
			console.log(error);
			res.status(500).set('Content-Type', 'text/plain').send('Error adding record to database');
		}
	});
	res.status(200).set('Content-Type', 'text/plain').send('Record successfully added to database');
});
app.post('/handleDeleteCar', (req, res) => {
	database.remove({ _id: req.body.id }, {}, (error, numRemoved) => {
		if (error){
			console.log(error);
			res.status(500).set('Content-Type', 'text/plain').send('Error deleting record from database');
		}
		console.log('Successfully deleted ' + numRemoved + ' record(s)');
		const newRecords = database.find({}, (error, docs) => {
			if (error) {
				console.log(error);
				res.status(500).set('Content-Type', 'text/plain').send('Error reading database');
			}
			res.status(200).render('list.hbs', { records: docs, keys: Object.keys(docs[0]) });
		});
	});
});
app.get('/list', (req, res) => {
	database.find({}, (error, docs) => {
		if (error) {
			console.log(error);
			res.status(500).set('Content-Type', 'text/plain').send('Error reading database');
		}
		res.render('list.hbs', { records: docs, keys: Object.keys(docs[0]) });
	});
});

// --- Server start ---
app.listen(3000, () => {
	console.log('Server is running on port 3000');
});