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
            transaction['eur-con'] = calculateOtherCurrencyConversion(transaction.amount);
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
            cell.setAttribute('data-key', key);
            row.appendChild(cell);
        }

        // Edit button
        const editCell = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => enableEditing(row));
        editCell.appendChild(editButton);
        row.appendChild(editCell);

        tableBody.appendChild(row);
    }

    function enableEditing(row) {
        row.classList.add('editable');

        Array.from(row.children).forEach(cell => {
            const key = cell.getAttribute('data-key');
            if (key && key !== 'eur-con') {
                const input = document.createElement('input');
                input.type = key === 'amount' ? 'number' : 'text';
                input.value = cell.textContent;
                input.setAttribute('data-key', key);
                cell.textContent = '';
                cell.appendChild(input);
            }
        });

        const editButton = row.querySelector('button');
        editButton.textContent = 'Save';
        editButton.removeEventListener('click', enableEditing);
        editButton.addEventListener('click', () => saveChanges(row));
    }

    function saveChanges(row) {
        const updatedTransaction = {};

        Array.from(row.children).forEach(cell => {
            const input = cell.querySelector('input');
            if (input) {
                const key = input.getAttribute('data-key');
                updatedTransaction[key] = input.value;
                cell.textContent = input.value;
            } else {
                const key = cell.getAttribute('data-key');
                updatedTransaction[key] = cell.textContent;
            }
        });

        // Recalculate EUR S. CON.
        if (updatedTransaction.currency === 'EUR') {
            updatedTransaction['eur-con'] = updatedTransaction.amount;
        } else if (updatedTransaction.currency === 'TWD') {
            updatedTransaction['eur-con'] = (updatedTransaction.amount / 35).toFixed(2);
        } else {
            updatedTransaction['eur-con'] = calculateOtherCurrencyConversion(updatedTransaction.amount);
        }

        const index = transactions.findIndex(t => t.date === updatedTransaction.date && t.who === updatedTransaction.who);
        transactions[index] = updatedTransaction;
        localStorage.setItem('transactions', JSON.stringify(transactions));

        row.classList.remove('editable');

        const editButton = row.querySelector('button');
        editButton.textContent = 'Edit';
        editButton.removeEventListener('click', saveChanges);
        editButton.addEventListener('click', () => enableEditing(row));
    }

    function calculateOtherCurrencyConversion(amount) {
        // Here you can implement any logic for conversion of 'OTHER' currency type
        // For now, we'll assume it returns the input amount, as conversion logic isn't provided
        return amount;
    }
});
