"use client";

import { useEffect, useRef } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import type { Block } from "@/lib/types";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface Props {
  projectId: string;
  onBlockUpdate: (block: Block) => void;
  children: React.ReactNode;
}

export default function RealtimeProvider({
  projectId,
  onBlockUpdate,
  children,
}: Props) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient();

    const channel = supabase
      .channel(`blocks:${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "blocks",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          onBlockUpdate(payload.new as Block);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, onBlockUpdate]);

  return <>{children}</>;
}
