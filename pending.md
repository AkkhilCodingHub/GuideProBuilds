# Pending Tasks & Progress - GuideProBuilds

## Overview
PC Building Guide and Hardware Configurator App.

## Recent Progress & Changes
- Major codebase restructuring: migrated top-level source directories (`app/`, `components/`, `hooks/`, `lib/`, `shared/`) into standard `src/` hierarchy (`src/app/`, `src/components/`, etc.).
- Updated project configuration files (`package.json`, `tsconfig.json`, `next.config.ts`, `vercel.json`, `components.json`).
- Added project configuration (`mise.toml`, `postcss.config.mjs`, `requirements.txt`).

## Pending / Next Steps
- [ ] Run `npm run build` to verify all import paths resolve correctly after directory restructuring.
- [ ] Verify Next.js page routes and API routes operate without breaking.
- [ ] Check PC builder compatibility logic and support services in `src/features/support/`.
- [ ] Update Vercel deployment settings if necessary for `src/` directory layout.
