"use client";

import { useState, useEffect, useReducer } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import type { ClaimWithBlock } from "@/lib/types";

interface Props {
  projectId: string;
}

export default function AdminReviewList({ projectId }: Props) {
  const [claims, setClaims] = useState<ClaimWithBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [refreshKey, refreshClaims] = useReducer((x: number) => x + 1, 0);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/admin/review?projectId=${projectId}`);
      const data = await res.json();
      if (!cancelled) {
        if (data.claims) setClaims(data.claims);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [projectId, refreshKey]);

  const handleReview = async (
    claimId: string,
    action: "approved" | "rejected"
  ) => {
    setActionError("");
    const res = await fetch("/api/admin/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claimId, action }),
    });
    if (res.ok) {
      refreshClaims();
    } else {
      const data = await res.json();
      setActionError(data.error || "操作失败");
    }
  };

  if (loading) {
    return <Typography>加载中...</Typography>;
  }

  const pendingClaims = claims.filter((c) => c.status === "pending");
  const reviewedClaims = claims.filter((c) => c.status !== "pending");

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        认领审核
      </Typography>

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}

      {pendingClaims.length === 0 ? (
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          暂无待审核的认领
        </Typography>
      ) : (
        <Stack spacing={2} sx={{ mb: 4 }}>
          {pendingClaims.map((claim) => (
            <Card key={claim.id} sx={{ display: "flex" }}>
              <CardMedia
                component="img"
                sx={{ width: 160, objectFit: "cover" }}
                image={`${supabaseUrl}/storage/v1/object/public/claim-images/${claim.image_path}`}
                alt="认领图片"
              />
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  格子 #{claim.blocks.index + 1} - {claim.blocks.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  昵称: {claim.nickname}
                </Typography>
                {claim.message && (
                  <Typography variant="body2" color="text.secondary">
                    留言: {claim.message}
                  </Typography>
                )}
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => handleReview(claim.id, "approved")}
                  >
                    通过
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleReview(claim.id, "rejected")}
                  >
                    拒绝
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {reviewedClaims.length > 0 && (
        <>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            已审核
          </Typography>
          <Stack spacing={1}>
            {reviewedClaims.map((claim) => (
              <Box
                key={claim.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  p: 1,
                  borderRadius: 1,
                  bgcolor: "grey.50",
                }}
              >
                <Typography variant="body2">
                  #{claim.blocks.index + 1} {claim.blocks.name} - {claim.nickname}
                </Typography>
                <Chip
                  label={claim.status === "approved" ? "已通过" : "已拒绝"}
                  color={claim.status === "approved" ? "success" : "error"}
                  size="small"
                />
              </Box>
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
}
