/*
 * Pursuit pipeline: the stages an opportunity moves through from first
 * sighting to submission, plus the working checklist for each tracked
 * opportunity. Tracking is keyed off bookmarks — bookmarking an opportunity
 * is what puts it in the pipeline, at "identified".
 */

export const STAGES = [
  "identified",
  "qualifying",
  "pursuing",
  "drafting",
  "submitted",
  "won",
  "lost",
] as const;

export type Stage = (typeof STAGES)[number];

export const STAGE_LABELS: Record<Stage, string> = {
  identified: "Identified",
  qualifying: "Qualifying",
  pursuing: "Pursuing",
  drafting: "Drafting",
  submitted: "Submitted",
  won: "Won",
  lost: "Lost",
};

/** Stages where the pursuit is still active and deadlines still matter. */
export const ACTIVE_STAGES: Stage[] = ["identified", "qualifying", "pursuing", "drafting"];

export interface PipelineTask {
  id: string;
  label: string;
  done: boolean;
}

export interface PipelineEntry {
  stage: Stage;
  tasks: PipelineTask[];
}

/**
 * The standard federal-pursuit checklist. Generic on purpose: it covers the
 * steps nearly every solicitation shares. Seeding tasks from the specific
 * solicitation's requirements text is a planned Assistant feature.
 */
const DEFAULT_TASK_LABELS = [
  "Confirm eligibility against solicitation terms",
  "Verify SAM.gov registration is active",
  "Contact the program manager / point of contact",
  "Attend proposers day or Q&A if offered",
  "Identify teaming partners",
  "Draft capability abstract / white paper",
  "Write full proposal",
  "Internal review and budget sign-off",
  "Submit before deadline",
];

export function newPipelineEntry(): PipelineEntry {
  return {
    stage: "identified",
    tasks: DEFAULT_TASK_LABELS.map((label, i) => ({ id: `t${i}`, label, done: false })),
  };
}

function isStage(x: unknown): x is Stage {
  return typeof x === "string" && (STAGES as readonly string[]).includes(x);
}

/** Codec for persistence — tolerates malformed storage by falling back per entry. */
export const pipelineCodec = {
  pack: (p: Record<string, PipelineEntry>) => p,
  unpack: (raw: unknown): Record<string, PipelineEntry> => {
    if (typeof raw !== "object" || raw === null) return {};
    const out: Record<string, PipelineEntry> = {};
    for (const [id, e] of Object.entries(raw as Record<string, unknown>)) {
      const entry = e as { stage?: unknown; tasks?: unknown };
      if (!isStage(entry?.stage)) continue;
      const fresh = newPipelineEntry();
      const savedTasks = Array.isArray(entry.tasks) ? (entry.tasks as PipelineTask[]) : [];
      out[id] = {
        stage: entry.stage,
        // Re-merge on the current template so label edits in code propagate;
        // done-ness is what the user owns.
        tasks: fresh.tasks.map((t) => ({
          ...t,
          done: savedTasks.find((s) => s?.id === t.id)?.done === true,
        })),
      };
    }
    return out;
  },
};
