document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('dataForm');
    const table = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
    let editingRow = null;

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const entry = {
            date: formData.get('date'),
            who: formData.get('who'),
            to: formData.get('to'),
            method: formData.get('method'),
            category: formData.get('category'),
            description: formData.get('description'),
            amount: parseFloat(formData.get('amount')),
            currency: formData.get('currency'),
            eur_conversion: calculateEurConversion(parseFloat(formData.get('amount')), formData.get('currency'))
        };

        if (entry.currency === 'OTHER') {
            entry.eur_conversion = parseFloat(formData.get('eur_conversion'));
        }

        if (editingRow) {
            updateTableRow(editingRow, entry);
        } else {
            addTableRow(entry);
        }

        submitData(entry);
        form.reset();
        editingRow = null;
    });

    function calculateEurConversion(amount, currency) {
        switch (currency) {
            case 'EUR':
                return amount;
            case 'TWD':
                return amount * 0.028; // assuming 1 TWD = 0.028 EUR
            default:
                return 0;
        }
    }

    function addTableRow(entry) {
        const newRow = table.insertRow();
        const cells = Object.keys(entry).map(() => newRow.insertCell());

        cells[0].textContent = entry.date;
        cells[1].textContent = entry.who;
        cells[2].textContent = entry.to;
        cells[3].textContent = entry.method;
        cells[4].textContent = entry.category;
        cells[5].textContent = entry.description;
        cells[6].textContent = entry.amount;
        cells[7].textContent = entry.currency;
        cells[8].textContent = entry.eur_conversion;
        cells[9].innerHTML = '<span class="edit-btn">Edit</span>';

        const editBtn = cells[9].querySelector('.edit-btn');
        editBtn.addEventListener('click', () => editTableRow(newRow, entry));
    }

    function updateTableRow(row, entry) {
        row.cells[0].textContent = entry.date;
        row.cells[1].textContent = entry.who;
        row.cells[2].textContent = entry.to;
        row.cells[3].textContent = entry.method;
        row.cells[4].textContent = entry.category;
        row.cells[5].textContent = entry.description;
        row.cells[6].textContent = entry.amount;
        row.cells[7].textContent = entry.currency;
        row.cells[8].textContent = entry.eur_conversion;
        alert('Entry updated successfully!');
    }

    function editTableRow(row, entry) {
        document.getElementById('date').value = entry.date;
        document.getElementById('who').value = entry.who;
        document.getElementById('to').value = entry.to;
        document.getElementById('method').value = entry.method;
        document.getElementById('category').value = entry.category;
        document.getElementById('description').value = entry.description;
        document.getElementById('amount').value = entry.amount;
        document.getElementById('currency').value = entry.currency;
        document.getElementById('eur_conversion').value = entry.eur_conversion;
        editingRow = row;
    }

    function submitData(entry) {
        fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(entry)
        })
        .then(response => response.text())
        .then(data => {
            if (data !== 'Success') {
                alert('Error submitting data');
            }
        })
        .catch(() => alert('Error submitting data'));
    }

    function loadData() {
        fetch('/data')
            .then(response => response.text())
            .then(data => {
                const rows = data.split('\n').filter(row => row).map(row => row.split(','));
                rows.forEach(row => {
                    if (row.length === 9) {
                        const entry = {
                            date: row[0],
                            who: row[1],
                            to: row[2],
                            method: row[3],
                            category: row[4],
                            description: row[5],
                            amount: parseFloat(row[6]),
                            currency: row[7],
                            eur_conversion: parseFloat(row[8])
                        };
                        addTableRow(entry);
                    }
                });
            })
            .catch(() => alert('Error loading data'));
    }

    loadData();
});
