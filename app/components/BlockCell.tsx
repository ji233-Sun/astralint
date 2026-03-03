"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { getBlockBackgroundStyle } from "@/lib/grid";
import type { Block } from "@/lib/types";

interface Props {
  block: Block;
  sourceImageUrl: string;
  cols: number;
  rows: number;
  onClick: (block: Block) => void;
}

export default function BlockCell({
  block,
  sourceImageUrl,
  cols,
  rows,
  onClick,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const isApproved = block.status === "approved";
  const isPending = block.status === "pending";
  const isUnclaimed = block.status === "unclaimed";

  const bgStyle = isApproved
    ? {
        backgroundImage: `url(${sourceImageUrl})`,
        ...getBlockBackgroundStyle(block.row, block.col, cols, rows),
      }
    : {};

  return (
    <Tooltip
      title={
        isPending
          ? `${block.name} - 审核中`
          : isApproved
            ? `${block.name} - 已点亮`
            : `${block.name} - 点击认领`
      }
      arrow
    >
      <Box
        onClick={() => isUnclaimed && onClick(block)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          position: "relative",
          aspectRatio: "1",
          cursor: isUnclaimed ? "pointer" : "default",
          borderRadius: "4px",
          overflow: "hidden",
          transition: "all 0.3s ease",
          border: "1px solid",
          borderColor: isApproved
            ? "transparent"
            : isPending
              ? "warning.main"
              : "divider",
          bgcolor: isApproved ? "transparent" : "grey.200",
          transform: hovered && isUnclaimed ? "scale(1.05)" : "scale(1)",
          zIndex: hovered ? 1 : 0,
          ...bgStyle,
          ...(isPending && {
            animation: "pulse 2s ease-in-out infinite",
            "@keyframes pulse": {
              "0%, 100%": { opacity: 0.6 },
              "50%": { opacity: 1 },
            },
          }),
        }}
      >
        {!isApproved && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: isPending
                ? "rgba(245, 158, 11, 0.15)"
                : "rgba(0,0,0,0.04)",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: isPending ? "warning.dark" : "text.secondary",
                fontWeight: 600,
                fontSize: { xs: "0.6rem", sm: "0.75rem" },
                textAlign: "center",
                px: 0.5,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "90%",
              }}
            >
              {isPending ? "审核中" : block.name}
            </Typography>
          </Box>
        )}
      </Box>
    </Tooltip>
  );
}
