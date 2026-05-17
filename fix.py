path="c:/Users/siste/Documents/redone/src/lib/gbolService.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("const cajanom = row['caja'] || row['cajanom'] || row['caja nombre'];", "const cajanom = row['cajanom'] || row['caja nombre'] || row['caja'];")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
