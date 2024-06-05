from flask import Flask, request, render_template, redirect, url_for
import csv
import os

app = Flask(__name__)

CSV_FILE = 'data.csv'

@app.route('/')
def index():
    data = read_csv()
    return render_template('index.html', data=data)

@app.route('/add', methods=['POST'])
def add_entry():
    new_entry = request.form.to_dict()
    write_csv(new_entry)
    return redirect(url_for('index'))

@app.route('/edit', methods=['POST'])
def edit_entry():
    updated_entry = request.form.to_dict()
    data = read_csv()
    for entry in data:
        if entry['id'] == updated_entry['id']:
            entry.update(updated_entry)
    write_csv(data, mode='w')
    return redirect(url_for('index'))

def read_csv():
    if not os.path.exists(CSV_FILE):
        return []
    with open(CSV_FILE, mode='r', newline='') as file:
        reader = csv.DictReader(file)
        return list(reader)

def write_csv(data, mode='a'):
    fieldnames = data[0].keys() if isinstance(data, list) else data.keys()
    with open(CSV_FILE, mode=mode, newline='') as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        if mode == 'w':
            writer.writeheader()
        if isinstance(data, list):
            writer.writerows(data)
        else:
            writer.writerow(data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
