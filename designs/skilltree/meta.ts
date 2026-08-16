import type { DesignMeta } from "../types";

export const meta: DesignMeta = {
  slug: "skilltree",
  name: "Skill Tree",
  pitch: "A talent tree where every node you light up points at the work it built.",
  description:
    "A radial talent tree in the Path of Exile mould. Each skill group is a branch, each skill a node lit in proportion to its level, and selecting a node shows which projects actually used it — the tree is wired to the work, not just decoration.",
  tags: ["playful", "graph", "interactive"],
  palette: ["#070b14", "#4cc2ff", "#f0a91e", "#a855f7"],
  poster: "tree",
  interaction: "browse",
};

export default meta;
