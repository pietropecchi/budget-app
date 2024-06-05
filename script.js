$(document).ready(function() {
    const form = $('#transaction-form');
    const tableBody = $('#transaction-table tbody');

    // Load existing data from the server
    function loadTransactions() {
        $.get('http://localhost:8000/transactions', function(data) {
            tableBody.empty();
            data.forEach(transaction => addTransactionToTable(transaction));
        });
    }

    loadTransactions();

    form.on('submit', function(event) {
        event.preventDefault();
        const formData = form.serializeArray();
        const transaction = {};
        formData.forEach(item => transaction[item.name] = item.value);

        $.post('http://localhost:8000/transactions', JSON.stringify(transaction), function(newTransaction) {
            addTransactionToTable(newTransaction);
            form[0].reset();
        }, 'json');
    });

    function addTransactionToTable(transaction) {
        const row = $('<tr></tr>');

        for (const key in transaction) {
            const cell = $('<td></td>').text(transaction[key]).attr('data-key', key);
            row.append(cell);
        }

        // Edit button
        const editCell = $('<td></td>');
        const editButton = $('<button class="btn btn-secondary btn-sm">Edit</button>');
        editButton.on('click', () => enableEditing(row, transaction));
        editCell.append(editButton);
        row.append(editCell);

        tableBody.append(row);
    }

    function enableEditing(row, transaction) {
        row.addClass('editable');

        row.children('td').each(function() {
            const cell = $(this);
            const key = cell.attr('data-key');
            if (key && key !== 'id') {
                const input = $('<input>').attr('type', key === 'amount' ? 'number' : 'text')
                                          .val(cell.text())
                                          .attr('data-key', key)
                                          .addClass('form-control');
                cell.html(input);
            }
        });

        const editButton = row.find('button');
        editButton.text('Save');
        editButton.off('click').on('click', () => saveChanges(row, transaction));
    }

    function saveChanges(row, originalTransaction) {
        const updatedTransaction = { id: originalTransaction.id };

        row.children('td').each(function() {
            const cell = $(this);
            const input = cell.find('input');
            if (input.length) {
                const key = input.attr('data-key');
                updatedTransaction[key] = input.val();
                cell.text(input.val());
            } else {
                const key = cell.attr('data-key');
                updatedTransaction[key] = cell.text();
            }
        });

        $.ajax({
            url: `http://localhost:8000/transactions/${originalTransaction.id}`,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(updatedTransaction),
            success: function() {
                loadTransactions();
            }
        });

        row.removeClass('editable');

        const editButton = row.find('button');
        editButton.text('Edit');
        editButton.off('click').on('click', () => enableEditing(row, updatedTransaction));
    }
});
