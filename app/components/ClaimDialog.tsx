"use client";

import { useState, useRef } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import type { Block } from "@/lib/types";

interface Props {
  block: Block | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ClaimDialog({ block, open, onClose, onSuccess }: Props) {
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!block || !file || !nickname.trim()) return;
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("blockId", block.id);
    formData.append("nickname", nickname.trim());
    formData.append("message", message.trim());
    formData.append("image", file);

    const res = await fetch("/api/claim", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      setNickname("");
      setMessage("");
      setFile(null);
      setPreview("");
      onSuccess();
      onClose();
    } else {
      const data = await res.json();
      setError(data.error || "提交失败");
    }
    setLoading(false);
  };

  const handleClose = () => {
    if (loading) return;
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        认领格子 {block ? `#${block.index + 1} - ${block.name}` : ""}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="你的昵称"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />

          <TextField
            fullWidth
            label="留言（可选）"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            multiline
            rows={2}
          />

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
          />
          <Button
            variant="outlined"
            onClick={() => inputRef.current?.click()}
          >
            {file ? file.name : "上传你的图片"}
          </Button>

          {preview && (
            <Box
              component="img"
              src={preview}
              sx={{
                maxWidth: "100%",
                maxHeight: 200,
                objectFit: "contain",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
              }}
            />
          )}

          <Typography variant="caption" color="text.secondary">
            上传一张图片认领这个格子，管理员审核通过后格子将被点亮
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          取消
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!nickname.trim() || !file || loading}
        >
          {loading ? "提交中..." : "提交认领"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
