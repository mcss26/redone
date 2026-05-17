path = r'C:\Users\siste\OneDrive\Downloads\Inventario - FormulaMid_files\tester_3.0-20260201T131327Z-3-001\tester_3.0\.agent\data\Factura electrónica - 1_28_2026.csv'
with open(path, 'r', encoding='utf-8', errors='replace') as f:
    for i in range(5):
        print(repr(f.readline()))
