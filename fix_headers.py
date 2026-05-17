path="c:/Users/siste/Documents/redone/src/lib/gbolService.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

target = """                    const delimiter = lines[0].includes(';') ? ';' : ',';
                    const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase());
                    
                    const records = [];
                    for (let i = 1; i < lines.length; i++) {"""

replace = """                    const headerIdx = lines.findIndex(l => l.toLowerCase().includes('ptovta') || l.toLowerCase().includes('caja'));
                    if (headerIdx === -1) throw new Error("No se encontraron los encabezados en el CSV.");
                    
                    const delimiter = lines[headerIdx].includes(';') ? ';' : ',';
                    const headers = lines[headerIdx].split(delimiter).map(h => h.trim().toLowerCase());
                    
                    const records = [];
                    for (let i = headerIdx + 1; i < lines.length; i++) {"""

if target in content:
    content = content.replace(target, replace)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Replaced GbolService logic")
else:
    print("Target not found. Let's try flexible replace.")
    import re
    # Match the logic flexibly
    content = re.sub(r"const delimiter = lines\[0\]\.includes.*?\n.*?for \(let i = 1; i < lines\.length; i\+\+\) \{", replace, content, flags=re.DOTALL)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Replaced with regex")
