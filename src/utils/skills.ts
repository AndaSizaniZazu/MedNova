import { useState } from "react";
import { API_BASE } from "@/utils/api";

export type Draft = {
  draft_id: string;
  status: string;
  feature: string;
  skill: string;
  model: string;
  content: string;
  structured: Record<string, unknown> | null;
  expires_at: string;
  disclaimer: string;
};

export type ReviewOutcome = "Accepted" | "Edited" | "Rejected";

export const roles = ["doctor", "nurse", "billing", "admin"];

const DEMO_USER = "demo-user";

/** Calls a MedNova skill endpoint (/api/ai/*) and tracks the draft through human sign-off. */
export const useSkillDraft = (defaultRole = "doctor") => {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState<string | null>(null);
  const [role, setRole] = useState(defaultRole);

  const run = async (path: string, body: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    setDraft(null);
    setReviewStatus(null);
    try {
      const response = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: DEMO_USER, role, ...body }),
      });
      const data = await response.json();
      if (response.ok) {
        setDraft(data);
      } else {
        setError(typeof data.detail === "string" ? data.detail : "Request failed - check the input.");
      }
    } catch {
      setError("Could not reach the MedNova API.");
    }
    setLoading(false);
  };

  const review = async (outcome: ReviewOutcome): Promise<boolean> => {
    if (!draft) return false;
    try {
      const response = await fetch(`${API_BASE}/api/ai/drafts/${draft.draft_id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: DEMO_USER, role, outcome }),
      });
      const data = await response.json();
      setReviewStatus(response.ok ? `${data.status} (${outcome})` : data.detail);
      return response.ok;
    } catch {
      setReviewStatus("Could not reach the MedNova API.");
      return false;
    }
  };

  const reset = () => {
    setDraft(null);
    setError(null);
    setReviewStatus(null);
  };

  return { draft, loading, error, reviewStatus, role, setRole, run, review, reset, setError };
};

export type SkillDraftState = ReturnType<typeof useSkillDraft>;
