"use client";

import Box from "@mui/material/Box";
import BlockCell from "./BlockCell";
import type { Block } from "@/lib/types";

interface Props {
  blocks: Block[];
  sourceImageUrl: string;
  cols: number;
  rows: number;
  onBlockClick: (block: Block) => void;
}

export default function ImageGrid({
  blocks,
  sourceImageUrl,
  cols,
  rows,
  onBlockClick,
}: Props) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: "2px",
        maxWidth: 800,
        mx: "auto",
        width: "100%",
      }}
    >
      {blocks.map((block) => (
        <BlockCell
          key={block.id}
          block={block}
          sourceImageUrl={sourceImageUrl}
          cols={cols}
          rows={rows}
          onClick={onBlockClick}
        />
      ))}
    </Box>
  );
}
