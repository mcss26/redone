---
name: supabase-cli-executor
description: Ejecuta consultas a la base de datos Supabase conectada al proyecto utilizando Supabase CLI de forma segura.
---

# Supabase CLI Executor Skill

This skill allows the agent to interact with the Supabase database directly to verify schemas, read tables, and perform queries safely.

## Usage

Use the terminal command `npx supabase db query "<your query>"` to execute SQL queries.
Wait, since we linked the project, we should use `npx supabase db query "<your query>" --linked` or `--remote` depending on the CLI version. Or just `npx supabase db query` if the env/context is set up.

Example to verify a schema:
```bash
npx supabase db query "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'public';" --linked
```

## Rules
1. DO NOT create or modify tables without explicit user approval.
2. ALWAYS use this skill to check the schema of a table before creating a component or writing queries that interact with it.
3. Keep queries optimized and limit row outputs (`LIMIT 5`) when checking data samples.
