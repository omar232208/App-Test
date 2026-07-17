#!/usr/bin/env pwsh
# post-merge hook (Windows/PowerShell)
pnpm install --frozen-lockfile
if ($?) { pnpm --filter db push }
