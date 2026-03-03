"use client";

import { useState, useEffect, useCallback, useReducer } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import ImageGrid from "@/app/components/ImageGrid";
import ClaimDialog from "@/app/components/ClaimDialog";
import RealtimeProvider from "@/app/components/RealtimeProvider";
import type { Project, Block } from "@/lib/types";

function HomeContent() {
  const [project, setProject] = useState<Project | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshKey, refreshData] = useReducer((x: number) => x + 1, 0);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const projectRes = await fetch("/api/admin/project");
      const projectData = await projectRes.json();

      if (!projectData.project) {
        if (!cancelled) setLoading(false);
        return;
      }

      if (!cancelled) setProject(projectData.project);

      const blocksRes = await fetch(
        `/api/admin/blocks?projectId=${projectData.project.id}`
      );
      const blocksData = await blocksRes.json();
      if (!cancelled) {
        if (blocksData.blocks) setBlocks(blocksData.blocks);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const handleBlockClick = (block: Block) => {
    setSelectedBlock(block);
    setDialogOpen(true);
  };

  const handleBlockUpdate = useCallback((updatedBlock: Block) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === updatedBlock.id ? { ...b, ...updatedBlock } : b))
    );
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LinearProgress sx={{ width: 200 }} />
      </Box>
    );
  }

  if (!project) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h5" color="text.secondary">
          暂无项目
        </Typography>
      </Box>
    );
  }

  const approvedCount = blocks.filter((b) => b.status === "approved").length;
  const progress = (approvedCount / blocks.length) * 100;

  const sourceImageUrl = `${supabaseUrl}/storage/v1/object/public/source-images/${project.source_image_path}`;

  return (
    <RealtimeProvider projectId={project.id} onBlockUpdate={handleBlockUpdate}>
      <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 4 }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Astralint
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              点击灰色格子认领，管理员审核通过后点亮
            </Typography>
            <Box sx={{ maxWidth: 400, mx: "auto" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  进度
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {approvedCount}/{blocks.length} ({Math.round(progress)}%)
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Box>

          <ImageGrid
            blocks={blocks}
            sourceImageUrl={sourceImageUrl}
            cols={project.grid_cols}
            rows={project.grid_rows}
            onBlockClick={handleBlockClick}
          />

          <ClaimDialog
            block={selectedBlock}
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            onSuccess={refreshData}
          />
        </Container>
      </Box>
    </RealtimeProvider>
  );
}

export default function Home() {
  return <HomeContent />;
}
