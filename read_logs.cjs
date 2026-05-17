const fs = require('fs');
const path = 'C:\\Users\\siste\\.gemini\\antigravity\\brain\\027baf4b-bac7-4254-a7cf-6370f51faf43\\.system_generated\\logs\\overview.txt';
try {
  let content = fs.readFileSync(path, 'utf8');
  let idx = content.indexOf('master-proveedores');
  if (idx === -1) idx = content.indexOf('master_proveedores');
  
  if (idx !== -1) {
    console.log(content.substring(Math.max(0, idx - 500), idx + 2000));
  } else {
    // try utf16le
    content = fs.readFileSync(path, 'utf16le');
    idx = content.indexOf('master-proveedores');
    if (idx === -1) idx = content.indexOf('master_proveedores');
    if (idx !== -1) {
      console.log(content.substring(Math.max(0, idx - 500), idx + 2000));
    } else {
      console.log("NOT FOUND in logs");
    }
  }
} catch (e) {
  console.error(e);
}
