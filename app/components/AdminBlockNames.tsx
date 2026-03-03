"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import type { Block } from "@/lib/types";

interface Props {
  projectId: string;
}

export default function AdminBlockNames({ projectId }: Props) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/admin/blocks?projectId=${projectId}`);
      const data = await res.json();
      if (!cancelled && data.blocks) setBlocks(data.blocks);
    })();
    return () => { cancelled = true; };
  }, [projectId]);

  const handleNameChange = (id: string, name: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, name } : b))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/blocks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blocks: blocks.map((b) => ({ id: b.id, name: b.name })),
      }),
    });
    if (res.ok) {
      setMessage("保存成功");
    } else {
      setMessage("保存失败");
    }
    setSaving(false);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        格子命名
      </Typography>

      {message && (
        <Alert
          severity={message === "保存成功" ? "success" : "error"}
          sx={{ mb: 2 }}
        >
          {message}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 1,
          mb: 2,
        }}
      >
        {blocks.map((block) => (
          <TextField
            key={block.id}
            size="small"
            label={`#${block.index + 1} (${block.row},${block.col})`}
            value={block.name}
            onChange={(e) => handleNameChange(block.id, e.target.value)}
          />
        ))}
      </Box>

      <Button
        variant="contained"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "保存中..." : "保存名称"}
      </Button>
    </Box>
  );
}
