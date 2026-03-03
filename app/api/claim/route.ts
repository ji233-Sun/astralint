import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { ensurePublicBucket } from "@/lib/supabase/storage";

export async function POST(request: Request) {
  const formData = await request.formData();
  const blockId = formData.get("blockId") as string;
  const nickname = formData.get("nickname") as string;
  const message = (formData.get("message") as string) || "";
  const file = formData.get("image") as File | null;

  if (!blockId || !nickname || !file) {
    return NextResponse.json(
      { error: "需要 blockId、nickname 和图片" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  try {
    await ensurePublicBucket(supabase, "claim-images");
  } catch (error) {
    const message = error instanceof Error ? error.message : "无法初始化存储桶";
    return NextResponse.json({ error: `存储初始化失败: ${message}` }, { status: 500 });
  }

  // 乐观锁：只有 unclaimed 状态才能认领
  const { data: updated, error: updateError } = await supabase
    .from("blocks")
    .update({ status: "pending" })
    .eq("id", blockId)
    .eq("status", "unclaimed")
    .select()
    .single();

  if (updateError || !updated) {
    return NextResponse.json(
      { error: "该格子已被认领或不存在" },
      { status: 409 }
    );
  }

  // 上传图片
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileName = `${blockId}-${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("claim-images")
    .upload(fileName, buffer, { contentType: file.type });

  if (uploadError) {
    // 回滚格子状态
    await supabase
      .from("blocks")
      .update({ status: "unclaimed" })
      .eq("id", blockId);
    return NextResponse.json(
      { error: `图片上传失败: ${uploadError.message}` },
      { status: 500 }
    );
  }

  // 创建认领记录
  const { error: claimError } = await supabase.from("claims").insert({
    block_id: blockId,
    nickname,
    message,
    image_path: fileName,
  });

  if (claimError) {
    await supabase
      .from("blocks")
      .update({ status: "unclaimed" })
      .eq("id", blockId);
    return NextResponse.json(
      { error: claimError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
