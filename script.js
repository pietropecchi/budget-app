document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('transaction-form');
    const tableBody = document.querySelector('#transaction-table tbody');

    // Load existing data from local storage
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    transactions.forEach(transaction => addTransactionToTable(transaction));

    form.addEventListener('submit', event => {
        event.preventDefault();
        const formData = new FormData(form);
        const transaction = Object.fromEntries(formData.entries());

        // Calculate EUR S. CON.
        if (transaction.currency === 'EUR') {
            transaction['eur-con'] = transaction.amount;
        } else if (transaction.currency === 'TWD') {
            transaction['eur-con'] = (transaction.amount / 35).toFixed(2);
        } else {
            transaction['eur-con'] = prompt('Please enter conversion to EUR:');
        }

        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));

        addTransactionToTable(transaction);
        form.reset();
    });

    function addTransactionToTable(transaction) {
        const row = document.createElement('tr');

        for (const key in transaction) {
            const cell = document.createElement('td');
            cell.textContent = transaction[key];
            row.appendChild(cell);
        }

        // Edit button
        const editCell = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => editTransaction(row, transaction));
        editCell.appendChild(editButton);
        row.appendChild(editCell);

        tableBody.appendChild(row);
    }

    function editTransaction(row, transaction) {
        for (const key in transaction) {
            const input = document.querySelector(`#transaction-form [name="${key}"]`);
            if (input) {
                input.value = transaction[key];
            }
        }
        tableBody.removeChild(row);

        transactions = transactions.filter(t => t !== transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }
});
