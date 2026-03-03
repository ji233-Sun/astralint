"use client";

import { useState, useEffect, useReducer } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Chip from "@mui/material/Chip";
import AdminProjectSetup from "@/app/components/AdminProjectSetup";
import AdminBlockNames from "@/app/components/AdminBlockNames";
import AdminReviewList from "@/app/components/AdminReviewList";
import type { Project } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [refreshKey, refresh] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/admin/project");
      const data = await res.json();
      if (!cancelled) {
        setProject(data.project);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }} fontWeight={700}>
            Astralint 管理后台
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            退出
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {loading ? (
          <Typography>加载中...</Typography>
        ) : !project ? (
          <Paper sx={{ p: 3 }}>
            <AdminProjectSetup onCreated={refresh} />
          </Paper>
        ) : (
          <>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2 }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  当前项目
                </Typography>
                <Chip
                  label={`${project.grid_cols}x${project.grid_rows} = ${project.total_blocks} 格`}
                  size="small"
                />
                <Chip
                  label={`${project.source_image_width}x${project.source_image_height}`}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Paper>

            <Paper sx={{ mb: 3 }}>
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                sx={{ borderBottom: 1, borderColor: "divider" }}
              >
                <Tab label="格子命名" />
                <Tab label="审核认领" />
                <Tab label="新建项目" />
              </Tabs>

              <Box sx={{ p: 3 }}>
                {tab === 0 && <AdminBlockNames projectId={project.id} />}
                {tab === 1 && <AdminReviewList projectId={project.id} />}
                {tab === 2 && <AdminProjectSetup onCreated={refresh} />}
              </Box>
            </Paper>
          </>
        )}
      </Container>
    </Box>
  );
}
