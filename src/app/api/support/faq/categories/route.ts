import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    { id: 'getting-started', name: 'Getting Started' },
    { id: 'pc-building', name: 'PC Building' },
    { id: 'compatibility', name: 'Compatibility' },
    { id: 'troubleshooting', name: 'Troubleshooting' },
    { id: 'account', name: 'Account & Settings' },
  ]);
}
