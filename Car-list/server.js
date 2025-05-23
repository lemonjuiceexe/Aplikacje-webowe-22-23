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
	extname: 'hbs',
	helpers: {
		// Formats a boolean into a string
		formatBoolean: value => {
			switch (value){
				case true:
					return 'YES';
				case false:
					return 'NO';
				default:
					return 'NO DATA';
			}
		},
		// Returns the bootstrap class for the text color based on the boolean value
		colorClassForBoolean: value => {
			switch (value){
				case true:
					return 'text-success';
				case false:
					return 'text-danger';
				// Undefined
				default:
					return 'text-info';
			}
		},
		// Returns 1 for true, 0 for false, and -1 for undefined
		boolStatus: value => {
			if(value === undefined){
				return -1;
			}
			return value ? 1 : 0;
		},
		eq: (a, b) => a === b,
		increment: value => ++value
	}
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
// Table with all records with option to delete
app.get('/list', (req, res) => {
	database.find({}, (error, docs) => {
		if (error) {
			console.log(error);
			res.status(500).set('Content-Type', 'text/plain').send('Error reading database');
		}
		let keys = [];
		try{
			keys = Object.keys(docs[0]);
		} catch{
			keys = ["id"];
		}
		res.render('list.hbs',
			{
				records: docs,
				keys: keys,
				edit: false
			}
		);
	});
});
// Table with all records with option to edit
app.get('/edit', (req, res) => {
	database.find({}, (error, docs) => {
		if (error) {
			console.log(error);
			res.status(500).set('Content-Type', 'text/plain').send('Error reading database');
		}
		console.log(docs);
		let keys = [];
		try{
			keys = Object.keys(docs[0]);
		} catch{
			keys = ["id"];
		}
		res.render('list.hbs',
			{
				records: docs,
				keys: keys,
				edit: true
			}
		);
	});
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
			res.status(500).render('add.hbs', { error: `Failed to add a new record. Try again later.` });
		}
		res.status(200).render('add.hbs', { message: `Record added successfully with id ${newDoc._id}` });
	});
});
app.post('/handleDeleteCar', (req, res) => {
	database.remove({ _id: req.body.id }, {}, (error, numberOfDeletedDocs) => {
		if (error){
			console.log(error);
			res.status(500).set('Content-Type', 'text/plain').send('Error deleting record from database');
		}
		console.log('Successfully deleted ' + numberOfDeletedDocs + ' record(s)');
		const newRecords = database.find({}, (error, docs) => {
			if (error) {
				console.log(error);
				res.status(500).set('Content-Type', 'text/plain').send('Error reading database');
			}
			res.status(200).redirect('/list');
		});
	});
});
app.post('/handleEditCar', (req, res) => {
	// console.log("New doc: " + JSON.stringify(req.body) + req.body.insurance + " " + req.body.gas + " " + req.body.fourbyfour);

	let updatedRecord = {};
	// Incoming request defines all values as -1 (undefined), 0 (false) or 1 (true).
	// If undefined, the updated record should not contain said value.
	// Otherwise, the updated record should have this value set to true or false accordingly.
	for(let key of ["insurance", "gas", "damaged", "fourbyfour"]){ //TODO: If ever refactoring this, probably should not hard-code these keys anywhere
		if(req.body[key] !== "-1"){
			let valueToSet;
			console.log(key);
			console.log(typeof(req.body[key]));
			switch (req.body[key]){
				case "0":
					valueToSet = false;
					break;
				case "1":
					valueToSet = true;
					break;
				default:
					res.status(400).set('Content-Type', 'text/plain').send('Encountered Invalid parameter in POST request.');
					return;
			}
			updatedRecord[key] = valueToSet;
		}
	}

	database.update({ _id: req.body.id },
		updatedRecord,
		{},
		(error, numberOfReplacedDocs) => {
			if (error){
				console.log(error);
				res.status(500).set('Content-Type', 'text/plain').send('Error updating record in database');
			}
			console.log('Successfully updated ' + numberOfReplacedDocs + ' record(s)');
			console.log("New record: " + JSON.stringify(updatedRecord));
			const newRecords = database.find({}, (error, docs) => {
				if (error) {
					console.log(error);
					res.status(500).set('Content-Type', 'text/plain').send('Error reading database');
				}
				res.render('list.hbs',
				{
					records: docs,
					keys: Object.keys(docs[0]),
					edit: true
				});
			});
		}
	);
});
// Display list of cars with edit button
app.post('/handleCarEditList', (req, res) => {
	database.find({}, (error, docs) => {
		// Find the record to edit and change it to only have it's id and edit: true
		docs = docs.map(doc => {
			if (doc._id === req.body.id) {
				return {
					_id: doc._id,
					editThisRecord: true,
					insurance: doc.insurance,
					gas: doc.gas,
					damaged: doc.damaged,
					fourbyfour: doc.fourbyfour
				};
			}
			return doc;
		});
		res.render('list.hbs',
		{
			records: docs,
			keys: Object.keys(docs[0]),
			edit: true
		});
	});
});

// --- Server start ---
app.listen(3000, () => {
	console.log('Server is running on port 3000');
});