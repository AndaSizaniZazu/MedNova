import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, PencilLine, ShieldCheck, Download } from "lucide-react";
import type { ReactNode } from "react";
import { roles, type Draft, type ReviewOutcome, type SkillDraftState } from "@/utils/skills";

type DraftPanelProps = {
  state: SkillDraftState;
  placeholder: string;
  /** Custom rendering for structured (JSON) drafts; defaults to the draft text. */
  renderBody?: (draft: Draft) => ReactNode;
  onReviewed?: (outcome: ReviewOutcome) => void;
  downloadName?: string;
};

export const DraftPanel = ({ state, placeholder, renderBody, onReviewed, downloadName }: DraftPanelProps) => {
  const { draft, error, reviewStatus, role, setRole, review } = state;

  const handleReview = async (outcome: ReviewOutcome) => {
    if (await review(outcome)) onReviewed?.(outcome);
  };

  const handleDownload = () => {
    if (!draft) return;
    const content = draft.structured ? JSON.stringify(draft.structured, null, 2) : draft.content;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${downloadName ?? draft.feature}-${Date.now()}.${draft.structured ? "json" : "md"}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) {
    return <div className="rounded border border-red-100 bg-red-50 p-4 text-sm text-red-600">{error}</div>;
  }

  if (!draft) {
    return (
      <div className="rounded bg-background p-4 min-h-48 border border-primary/10 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">{placeholder}</p>
      </div>
    );
  }

  return (
    <div className="rounded bg-background p-4 border border-primary/10 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-yellow-50 text-yellow-700">{draft.status}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono">{draft.model}</span>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-3 w-3 mr-1" /> Download
          </Button>
        </div>
      </div>

      <div className="max-h-[480px] overflow-y-auto">
        {renderBody ? renderBody(draft) : <pre className="whitespace-pre-wrap text-sm font-sans">{draft.content}</pre>}
      </div>

      <p className="text-xs text-muted-foreground italic border-t pt-2">{draft.disclaimer}</p>

      {reviewStatus ? (
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <ShieldCheck className="h-4 w-4" /> {reviewStatus}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            aria-label="Reviewer role"
            className="px-2 py-1 rounded border border-gray-200 bg-background text-sm"
          >
            {roles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <Button size="sm" onClick={() => handleReview("Accepted")}>
            <CheckCircle2 className="h-4 w-4 mr-1" /> Sign off
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleReview("Edited")}>
            <PencilLine className="h-4 w-4 mr-1" /> Sign off with edits
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleReview("Rejected")}>
            <XCircle className="h-4 w-4 mr-1" /> Reject
          </Button>
        </div>
      )}
    </div>
  );
};
