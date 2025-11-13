Windows: Install and Use pnpm from C: (and stop using G:)

This project uses pnpm (version pinned in momentum-ai/package.json). If pnpm is currently installed on G: and you want Windows to use a pnpm on C: instead, follow one of the methods below. The Corepack method is recommended and safest.

Before you start
- Open a new PowerShell window (not CMD).
- Check your Node.js version: node -v
  - If Node >= 16.13, Corepack is available and recommended.

Method A — Corepack (recommended)
1) Enable Corepack and activate this repo’s pnpm version
   - corepack enable
   - corepack prepare pnpm@10.15.1 --activate

2) Verify pnpm is resolving from C:
   - where pnpm
   - pnpm -v
   Expect to see a path under C:\Users\<YourUser>\AppData\Local\... and version 10.15.1.

3) Optional: keep pnpm’s package store on C:
   - pnpm config set store-dir C:\pnpm-store
   - pnpm store path (verify)

Method B — npm global install on C:
Use this if Corepack isn’t available or you prefer npm -g.
1) Ensure npm’s global prefix is on C:
   - npm config set prefix "C:\\Users\\<YourUser>\\AppData\\Roaming\\npm"
   - [Environment]::SetEnvironmentVariable('Path', ($env:Path + ';C:\\Users\\<YourUser>\\AppData\\Roaming\\npm'), 'User')
   - Close and reopen PowerShell

2) Install pnpm globally (match repo version):
   - npm i -g pnpm@10.15.1

3) Verify:
   - where pnpm  (should point to C:\\Users\\<YourUser>\\AppData\\Roaming\\npm\\pnpm.cmd)
   - pnpm -v

Cleanup — stop Windows from picking the G: pnpm
If where pnpm shows a G:\... path, remove it from PATH so it won’t be used.
1) Windows Settings > System > About > Advanced system settings > Environment Variables…
2) In your User variables “Path”, remove any entries that point to G:\...\pnpm or G:\...\node_modules\.bin containing pnpm.
3) Move the C: entry above others if needed.
4) Open a new PowerShell, then re-check:
   - where pnpm
   - pnpm -v

Project validation (from C:)
Run these in a new PowerShell window:
- cd C:\Users\Jeremy\Desktop\FINAL_MOMENTUMAI\momentum-ai
- pnpm -v
- pnpm install --frozen-lockfile
- pnpm run build

Troubleshooting
- Multiple pnpm found: where pnpm lists all locations; the first is used. Ensure the C: path appears first and remove any G: entries.
- Shell cached PATH: open a new PowerShell after changing PATH or after corepack prepare.
- Node too old for Corepack: upgrade Node to >= 16.13, or use Method B.
- Store location: if space on C: is limited, choose a different store dir (e.g., C:\\pnpm-store) with pnpm config set store-dir.

Notes
- This repository pins pnpm in momentum-ai/package.json ("packageManager": "pnpm@10.15.1"). Corepack honors this pin, ensuring consistent installs.
