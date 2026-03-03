export interface Project {
  id: string;
  source_image_path: string;
  source_image_width: number;
  source_image_height: number;
  total_blocks: number;
  grid_cols: number;
  grid_rows: number;
  created_at: string;
}

export interface Block {
  id: string;
  project_id: string;
  index: number;
  row: number;
  col: number;
  name: string;
  status: "unclaimed" | "pending" | "approved" | "rejected";
  created_at: string;
}

export interface Claim {
  id: string;
  block_id: string;
  nickname: string;
  message: string;
  image_path: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  reviewed_at: string | null;
}

export interface ClaimWithBlock extends Claim {
  blocks: Pick<Block, "index" | "name" | "row" | "col">;
}
