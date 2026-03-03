/**
 * 计算网格布局：根据图片宽高和期望列数，算出行数和总块数。
 */
export function computeGrid(
  imageWidth: number,
  imageHeight: number,
  cols: number
) {
  const cellSize = imageWidth / cols;
  const rows = Math.ceil(imageHeight / cellSize);
  return { cols, rows, totalBlocks: cols * rows };
}

/**
 * 获取某个格子的 CSS background-position，使其显示源图对应区域。
 * row/col 从 0 开始。
 */
export function getBlockBackgroundStyle(
  row: number,
  col: number,
  cols: number,
  rows: number
) {
  const xPercent = cols <= 1 ? 0 : (col / (cols - 1)) * 100;
  const yPercent = rows <= 1 ? 0 : (row / (rows - 1)) * 100;
  return {
    backgroundSize: `${cols * 100}% ${rows * 100}%`,
    backgroundPosition: `${xPercent}% ${yPercent}%`,
  };
}
