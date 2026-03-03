import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// 更新格子名称
export async function PUT(request: Request) {
  const { blocks } = await request.json();

  if (!Array.isArray(blocks)) {
    return NextResponse.json({ error: "需要 blocks 数组" }, { status: 400 });
  }

  const supabase = createServiceClient();

  for (const block of blocks) {
    const { error } = await supabase
      .from("blocks")
      .update({ name: block.name })
      .eq("id", block.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}

// 获取项目的所有格子
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "需要 projectId" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("blocks")
    .select("*")
    .eq("project_id", projectId)
    .order("index");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ blocks: data });
}
