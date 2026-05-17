path="c:/Users/siste/Documents/redone/src/layouts/WorkdaysNightChief.jsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

import re

# Match the mock block and replace with fetch call
pattern = r"// TODO: En producción, recargar con datos reales\. Usamos mock visual por ahora:.*?\}\)\);"
replace = "// Fetch real data from DB now that sync is complete\n        await fetchNightChiefData(activeWorkday.work_date);"

new_content = re.sub(pattern, replace, content, flags=re.DOTALL)

with open(path, "w", encoding="utf-8") as f:
    f.write(new_content)
print("Replaced successfully")
