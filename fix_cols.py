path="c:/Users/siste/Documents/redone/src/layouts/WorkdaysNightChief.jsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("system_efectivo", "system_cash")
content = content.replace("declared_efectivo", "declared_cash")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

path2="c:/Users/siste/Documents/redone/src/lib/gbolService.js"
with open(path2, "r", encoding="utf-8") as f2:
    content2 = f2.read()

content2 = content2.replace("system_efectivo:", "system_cash:")

with open(path2, "w", encoding="utf-8") as f2:
    f2.write(content2)

print("Updated column names")
