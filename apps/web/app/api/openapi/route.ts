import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  const file = path.join(process.cwd(), "public", "openapi.yaml");
  const yaml = await readFile(file, "utf8");
  return new NextResponse(yaml, {
    headers: { "Content-Type": "application/yaml" },
  });
}
