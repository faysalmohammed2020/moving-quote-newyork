import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const dir = path.join(process.cwd(), "data");

    // Ensure 'data' directory exists
    await mkdir(dir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filePath = path.join(dir, `form-${timestamp}.json`);

    await writeFile(filePath, JSON.stringify(body, null, 2));

    return new Response(JSON.stringify({ message: "Saved successfully!" }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error saving data", error }), { status: 500 });
  }
}
