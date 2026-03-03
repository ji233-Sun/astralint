import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { computeGrid } from "@/lib/grid";
import { ensurePublicBucket } from "@/lib/supabase/storage";

// 创建项目
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("image") as File | null;
  const cols = Number(formData.get("cols"));

  if (!file || !cols || cols < 1) {
    return NextResponse.json(
      { error: "需要图片和列数" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  try {
    await ensurePublicBucket(supabase, "source-images");
  } catch (error) {
    const message = error instanceof Error ? error.message : "无法初始化存储桶";
    return NextResponse.json({ error: `存储初始化失败: ${message}` }, { status: 500 });
  }

  // 获取图片尺寸：通过读取图片头部信息
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 上传到 storage
  const fileName = `${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("source-images")
    .upload(fileName, buffer, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json(
      { error: `上传失败: ${uploadError.message}` },
      { status: 500 }
    );
  }

  // 获取图片尺寸（从客户端传入）
  const imageWidth = Number(formData.get("width"));
  const imageHeight = Number(formData.get("height"));

  if (!imageWidth || !imageHeight) {
    return NextResponse.json(
      { error: "需要图片宽高" },
      { status: 400 }
    );
  }

  const { rows, totalBlocks } = computeGrid(imageWidth, imageHeight, cols);

  // 创建项目记录
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      source_image_path: fileName,
      source_image_width: imageWidth,
      source_image_height: imageHeight,
      total_blocks: totalBlocks,
      grid_cols: cols,
      grid_rows: rows,
    })
    .select()
    .single();

  if (projectError) {
    return NextResponse.json(
      { error: projectError.message },
      { status: 500 }
    );
  }

  // 批量创建格子
  const blocks = [];
  for (let i = 0; i < totalBlocks; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    blocks.push({
      project_id: project.id,
      index: i,
      row,
      col,
      name: `${i + 1}`,
    });
  }

  const { error: blocksError } = await supabase.from("blocks").insert(blocks);
  if (blocksError) {
    return NextResponse.json(
      { error: blocksError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ project });
}

// 获取最新项目
export async function GET() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return NextResponse.json({ project: null });
  }

  return NextResponse.json({ project: data });
}
