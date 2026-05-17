import re

path = "c:/Users/siste/Documents/redone/src/layouts/WorkdaysNightChief.jsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# We want to change the pos_terminals fetch to include closing_terminals
pattern = r"const \{ data: posData, error: posError \} = await supabase\s*\.from\('pos_terminals'\)\s*\.select\('\*'\)\s*\.eq\('is_active', true\)\s*\.order\('friendly_name', \{ ascending: true \}\);\s*if \(posData\) setTerminals\(posData\);"

replace = """
        const { data: posData, error: posError } = await supabase
          .from('pos_terminals')
          .select('*')
          .eq('is_active', true)
          .order('friendly_name', { ascending: true });
          
        if (posData) {
          // Fetch existing closing terminals
          const { data: closings } = await supabase
            .from('closing_terminals')
            .select('*')
            .eq('work_day_id', workday.id);
            
          const mappedTerminals = posData.map(pt => {
            const match = closings?.find(c => c.terminal_id === pt.id) || {};
            return {
              ...pt,
              system_cash: match.system_cash,
              system_digital: match.system_digital,
              system_total: (match.system_cash !== undefined && match.system_digital !== undefined) ? Number(match.system_cash) + Number(match.system_digital) : undefined,
              declared_cash: match.declared_cash,
              declared_digital: match.declared_digital
            };
          });
          setTerminals(mappedTerminals);
        }
"""

new_content = re.sub(pattern, replace, content, flags=re.DOTALL)
with open(path, "w", encoding="utf-8") as f:
    f.write(new_content)
