import { userApp } from "@/lib/modules/user/applications/user_app";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // const result = await userApp.execute(body);
    // return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// ✅ Thêm hàm GET
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");
    // const id = idParam ? parseInt(idParam, 10) : undefined;

    // const result = await userApp.getAllOrGetById(id);
    // return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
