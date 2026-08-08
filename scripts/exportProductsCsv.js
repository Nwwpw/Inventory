const fs = require('fs');
const path = require('path');

function escapeCsv(value) {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

const jsonPath = path.join(__dirname, '..', 'products.json');
const csvPath = path.join(__dirname, '..', 'products.csv');

const raw = fs.readFileSync(jsonPath, 'utf8');
const data = JSON.parse(raw);

const headers = ['id','name','category','price','stock','image'];
const rows = data.map(p => (
  headers.map(h => escapeCsv(p[h] ?? '')).join(',')
));

const csv = headers.join(',') + '\n' + rows.join('\n');
fs.writeFileSync(csvPath, csv, 'utf8');
console.log('Wrote', csvPath, 'rows:', data.length);
