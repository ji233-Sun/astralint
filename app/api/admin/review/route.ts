import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// 获取待审核列表
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "需要 projectId" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("claims")
    .select("*, blocks!inner(index, name, row, col, project_id)")
    .eq("blocks.project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ claims: data });
}

// 审核认领
export async function POST(request: Request) {
  const { claimId, action } = await request.json();

  if (!claimId || !["approved", "rejected"].includes(action)) {
    return NextResponse.json(
      { error: "需要 claimId 和有效的 action" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  // 获取认领信息
  const { data: claim, error: claimError } = await supabase
    .from("claims")
    .select("*, blocks(*)")
    .eq("id", claimId)
    .single();

  if (claimError || !claim) {
    return NextResponse.json(
      { error: "认领不存在" },
      { status: 404 }
    );
  }

  // 更新认领状态
  const { error: updateClaimError } = await supabase
    .from("claims")
    .update({
      status: action,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", claimId);

  if (updateClaimError) {
    return NextResponse.json(
      { error: updateClaimError.message },
      { status: 500 }
    );
  }

  // 更新格子状态
  const blockStatus = action === "approved" ? "approved" : "unclaimed";
  const { error: updateBlockError } = await supabase
    .from("blocks")
    .update({ status: blockStatus })
    .eq("id", claim.block_id);

  if (updateBlockError) {
    return NextResponse.json(
      { error: updateBlockError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
