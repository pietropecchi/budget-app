const express = require('express');
const bodyParser = require('body-parser');
const { createObjectCsvWriter } = require('csv-writer');
const fs = require('fs');

const app = express();
const port = 3000;
const csvFilePath = 'data.csv';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const csvWriter = createObjectCsvWriter({
    path: csvFilePath,
    header: [
        { id: 'date', title: 'Date' },
        { id: 'who', title: 'Who' },
        { id: 'to', title: 'To' },
        { id: 'method', title: 'Method' },
        { id: 'category', title: 'Category' },
        { id: 'description', title: 'Purchases Description' },
        { id: 'amount', title: 'Amount' },
        { id: 'currency', title: 'Currency' },
        { id: 'eur_conversion', title: 'EUR S. CON.' }
    ],
    append: true
});

app.get('/data', (req, res) => {
    if (fs.existsSync(csvFilePath)) {
        fs.readFile(csvFilePath, 'utf8', (err, data) => {
            if (err) {
                res.status(500).send('Error reading data');
                return;
            }
            res.send(data);
        });
    } else {
        res.send('');
    }
});

app.post('/submit', (req, res) => {
    const entry = req.body;

    csvWriter.writeRecords([entry])
        .then(() => res.send('Success'))
        .catch(() => res.status(500).send('Error writing to CSV'));
});


