const fs = require('fs');

const parseCsvLine = (line, separator) => {
  const result = [];
  let inQuotes = false, current = '';
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') { inQuotes = !inQuotes; }
    else if (char === separator && !inQuotes) { result.push(current.trim().replace(/^"|"$/g, '')); current = ''; }
    else { current += char; }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
};

const text = fs.readFileSync('CONSUMO-06-06.csv', 'utf8');
const lines = text.split(/\r?\n/).filter(l => l.trim());
console.log("Total lines:", lines.length);

const sep = lines.some(l => l.includes(';')) ? ';' : ',';
console.log("Separator used:", sep);

let headers = [];
let headerIdx = 0;
for (let i = 0; i < lines.length; i++) {
  const row = parseCsvLine(lines[i], sep).map(h => h.toLowerCase().trim());
  if (row.some(h => h.includes('articulo') || h.includes('código') || h === 'id' || h === 'articulo')) {
    headers = row;
    headerIdx = i;
    break;
  }
}

console.log("Headers:", headers);
console.log("Header index:", headerIdx);

const artIdx = headers.findIndex(h => h.includes('articulo') || h === 'código' || h === 'id');
const detIdx = headers.findIndex(h => h.includes('detalle') || h === 'nombre' || h === 'name');
const qtyIdx = headers.findIndex(h => h.includes('cantidad') || h === 'qty' || h === 'consumo');

console.log("Indexes:", {artIdx, detIdx, qtyIdx});

const parsedData = [];
for (let i = headerIdx + 1; i < lines.length; i++) {
  const row = parseCsvLine(lines[i], sep);
  if (row.length <= Math.max(artIdx, qtyIdx)) continue;
  
  const articulo = row[artIdx];
  if (!articulo) continue;

  const rawQty = row[qtyIdx];
  const cleanQty = rawQty.replace(/,/g, '');
  const qtyNum = parseFloat(cleanQty) || 0;
  const detalle = detIdx !== -1 ? row[detIdx] : 'Desconocido';

  parsedData.push({
    system_id: articulo,
    detail: detalle,
    quantity: qtyNum
  });
}

console.log("Parsed Data count:", parsedData.length);
if (parsedData.length > 0) {
    console.log("First row:", parsedData[0]);
}
