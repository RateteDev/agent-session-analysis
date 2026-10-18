set shell := ["bash", "-eu", "-o", "pipefail", "-c"]

# Run static checks without changing files
[group('Quality')]
check:
    bunx biome check .
    bunx tsc --noEmit

# Apply automatic lint and formatting fixes
[group('Quality')]
fix:
    bunx biome check --write .

# Run all tests
[group('Testing')]
test:
    bun test tests

# Run the same checks used for local integration
[group('Quality')]
ci-local: check test

# Serve the archive viewer
[group('Run')]
serve host="0.0.0.0" port="4180":
    bun run src/server.ts --host {{host}} --port {{port}}

# Serve the archive viewer and reflect source edits without restarting
[group('Run')]
dev host="0.0.0.0" port="4180":
    bun run src/server.ts --host {{host}} --port {{port}} --dev
