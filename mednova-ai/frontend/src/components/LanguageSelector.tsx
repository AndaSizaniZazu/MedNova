import type { SupportedLanguage } from "../types/mednova";

const languages: { label: string; value: SupportedLanguage }[] = [
  { label: "English", value: "en" },
  { label: "Afrikaans", value: "af" },
  { label: "Zulu", value: "zu" },
  { label: "Xhosa", value: "xh" },
];

export default function LanguageSelector() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Language</h2>
      <p className="mt-2 text-sm text-slate-600">Language selector stub.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {languages.map((lang) => (
          <span
            key={lang.value}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600"
          >
            {lang.label}
          </span>
        ))}
      </div>
    </section>
  );
}