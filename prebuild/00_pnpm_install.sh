#!/bin/bash
# Skip npm install
echo "avoid using npm install and use pnpm"
npm i -g pnpm
pnpm install
pnpm run build