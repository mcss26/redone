import csv
from collections import defaultdict

path = r'C:\Users\siste\OneDrive\Downloads\Inventario - FormulaMid_files\tester_3.0-20260201T131327Z-3-001\tester_3.0\.agent\data\Factura electrónica - 1_28_2026.csv'
totals = defaultdict(float)

with open(path, 'r', encoding='utf-8', errors='replace') as f:
    # Skip first 3 lines
    for _ in range(3):
        next(f)
    reader = csv.DictReader(f, delimiter=';')
    for row in reader:
        caja = row.get('cajanom', '').strip()
        if not caja:
            caja = row.get('caja nombre', '').strip()
        if not caja:
            caja = row.get('caja', '').strip()
            
        importe_str = row.get('importe', '0').replace(',', '.')
        try:
            importe = float(importe_str)
        except:
            importe = 0.0
            
        if caja:
            totals[caja] += importe

print('Facturación total por caja (Monto Bruto Total):')
for caja, total in sorted(totals.items()):
    print(f'- {caja}: ${total:,.2f}')
print(f'\nTOTAL GENERAL: ${sum(totals.values()):,.2f}')
