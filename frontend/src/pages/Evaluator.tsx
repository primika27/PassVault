import { useState } from "react";
import { Button } from "#components/ui/button";
import { evaluatePassword } from "../utils/passwordEvaluator";

export default function Evaluator() {
  const [password, setPassword] = useState("");
  const [evaluation, setEvaluation] = useState<ReturnType<
    typeof evaluatePassword
  > | null>(null);

  const handleEvaluatePassword = () => {
    if (!password) return;
    const result = evaluatePassword(password);
    setEvaluation(result);
  };

  const getScoreColor = (score: number) => {
    switch (score) {
      case 0:
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case 1:
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case 2:
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case 3:
        return "bg-lime-500/20 text-lime-400 border-lime-500/30";
      case 4:
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  const scoreLabels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];

  return (
    <div className=" w-full max-w-2xl mx-auto rounded-2xl bg-zinc-950 text-white p-6 shadow-2xl border border-zinc-700/50 flex flex-col gap-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
          Password Strength Evaluator
        </h2>
        <p className="text-xs text-zinc-400">
          Analyze entropy, crack resistance, and dictionary patterns.
        </p>
      </div>

    
      <div className="relative rounded-xl bg-black border border-zinc-700/50 p-4 min-h-[4.5rem] flex items-center justify-between gap-3 shadow-inner focus-within:border-zinc-500 transition-colors">
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleEvaluatePassword()}
          placeholder="Enter a password"
          className="w-full text-center bg-transparent font-mono text-lg sm:text-xl  text-zinc-100 placeholder:text-zinc-600 font-medium tracking-wide outline-none border-none"
        />
        {password && (
          <button
            type="button"
            onClick={() => {
              setPassword("");
              setEvaluation(null);
            }}
            className="shrink-0 text-xs font-semibold text-zinc-400 hover:text-zinc-200 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <Button
        type="button"
        onClick={handleEvaluatePassword}
        className="w-full h-12 text-base font-bold text-white shadow-lg transition-all active:scale-[0.99] bg-emerald-600 hover:bg-emerald-500"
      >
        Evaluate Password
      </Button>

      {evaluation && (
        <div className="flex flex-col gap-4 p-4 rounded-xl bg-zinc-900/90 border border-zinc-700/50 animate-in fade-in-50 duration-200">
          {/* Strength Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
              <span className="text-zinc-400">Strength Score</span>
              <span
                className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${getScoreColor(
                  evaluation.score
                )}`}
              >
                {scoreLabels[evaluation.score]} ({evaluation.score}/4)
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    evaluation.score > step
                      ? step === 0
                        ? "bg-red-500"
                        : step === 1
                        ? "bg-amber-500"
                        : step === 2
                        ? "bg-lime-500"
                        : "bg-emerald-500"
                      : "bg-zinc-800"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-black/40 border border-zinc-800">
              <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold block">
                Estimated Crack Time
              </span>
              <span className="text-sm font-mono font-bold text-zinc-200 mt-0.5 block">
                {evaluation.crackTimeDisplay || "Instant"}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-zinc-800">
              <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold block">
                Guesses Needed
              </span>
              <span className="text-sm font-mono font-bold text-zinc-200 mt-0.5 block">
                {evaluation.guesses.toLocaleString()}
              </span>
            </div>
          </div>
          {(evaluation.warning || evaluation.suggestions.length > 0) && (
            <div className="pt-2 border-t border-zinc-800 space-y-1.5">
              {evaluation.warning && (
                <p className="text-xs text-amber-400 font-medium flex items-center gap-1.5">
                  {evaluation.warning}
                </p>
              )}
              {evaluation.suggestions.map((suggestion, idx) => (
                <p
                  key={idx}
                  className="text-xs text-zinc-400 flex items-center gap-1.5"
                >
                  {suggestion}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}