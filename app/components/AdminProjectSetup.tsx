"use client";

import { useState, useRef } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";

interface Props {
  onCreated: () => void;
}

export default function AdminProjectSetup({ onCreated }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [cols, setCols] = useState(5);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);

    const img = new Image();
    img.onload = () => {
      setImgSize({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = url;
  };

  const handleSubmit = async () => {
    if (!file || !imgSize.width) return;
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("cols", String(cols));
    formData.append("width", String(imgSize.width));
    formData.append("height", String(imgSize.height));

    const res = await fetch("/api/admin/project", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      onCreated();
    } else {
      const data = await res.json();
      setError(data.error || "创建失败");
    }
    setLoading(false);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        创建新项目
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2}>
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
          {file ? file.name : "选择源图片"}
        </Button>

        {preview && (
          <Box
            component="img"
            src={preview}
            sx={{
              maxWidth: "100%",
              maxHeight: 300,
              objectFit: "contain",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
            }}
          />
        )}

        {imgSize.width > 0 && (
          <Typography variant="body2" color="text.secondary">
            图片尺寸: {imgSize.width} x {imgSize.height}
          </Typography>
        )}

        <TextField
          type="number"
          label="列数"
          value={cols}
          onChange={(e) => setCols(Math.max(1, Number(e.target.value)))}
          slotProps={{ htmlInput: { min: 1, max: 20 } }}
        />

        {imgSize.width > 0 && (
          <Typography variant="body2" color="text.secondary">
            将生成 {cols} x {Math.ceil(imgSize.height / (imgSize.width / cols))}{" "}
            ={" "}
            {cols * Math.ceil(imgSize.height / (imgSize.width / cols))}{" "}
            个格子
          </Typography>
        )}

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!file || !imgSize.width || loading}
          size="large"
        >
          {loading ? "创建中..." : "创建项目"}
        </Button>
      </Stack>
    </Box>
  );
}
