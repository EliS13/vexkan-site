export interface ToolMeta {
  id: string;
  title: string;
  href: string;
  dek: string;
  accent: "purple" | "teal" | "amber";
}

export const tools: ToolMeta[] = [
  {
    id: "gear-ratio",
    title: "Gear Ratio & Speed/Torque Calculator",
    href: "/guide/tools/gear-ratio",
    dek: "Model wheel size, gear ratio, and motor count together and see the speed vs. torque tradeoff instantly.",
    accent: "purple",
  },
  {
    id: "mechanism-picker",
    title: "Intake & Outtake Decision Picker",
    href: "/guide/tools/mechanism-picker",
    dek: "Answer a few questions about your game element and get pointed toward the mechanism types worth prototyping.",
    accent: "teal",
  },
  {
    id: "season-planner",
    title: "Season Planner",
    href: "/guide/tools/season-planner",
    dek: "Competitions, deadlines, and build sessions with a countdown to the next one, exportable to your calendar.",
    accent: "amber",
  },
  {
    id: "notebook-template",
    title: "Engineering Notebook Template",
    href: "/guide/tools/notebook-template",
    dek: "Fill in a decision, a log entry, or a reference note the same way the book's notebook system is structured, then export it.",
    accent: "purple",
  },
];

export function getTool(id: string) {
  return tools.find((t) => t.id === id);
}
