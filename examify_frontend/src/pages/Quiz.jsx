import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useApiClient } from "../lib/useApiClient";
import AppShell from "../components/AppShell";

const TOTAL_TIME = 60;
function dnaColor(t) {
  return (
    {
      conceptual: "var(--dna-conceptual)",
      silly: "var(--dna-silly)",
      time: "var(--dna-time)",
      recall: "var(--dna-recall)",
      correct: "var(--dna-correct)",
    }[t] || "var(--text-muted)"
  );
}
function dnaLabel(t) {
  return (
    {
      conceptual: "CONCEPTUAL GAP",
      silly: "SILLY MISTAKE",
      time: "TIME PRESSURE",
      recall: "RECALL FAILURE",
      correct: "CORRECT",
    }[t] || String(t || "").toUpperCase()
  );
}
function toTitle(v) {
  return String(v || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (s) => s.toUpperCase());
}
async function readErr(r, f) {
  try {
    const d = await r.json();
    const raw = d?.message || d?.detail;
    if (!raw) return f;
    const s = String(raw);
    if (s.includes("unavailable"))
      return "Question generation unavailable. Check backend connectivity.";
    return s;
  } catch {
    return f;
  }
}

export default function Quiz() {
  const { apiFetch, isLoaded, isSignedIn } = useApiClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [sessionXP, setSessionXP] = useState(0);
  const [sessionResults, setSessionResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [expandExp, setExpandExp] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [total, setTotal] = useState(20);
  const completePosted = useRef(false);
  const fetchingRef = useRef(false);
  const question = questions[current];
  const query = new URLSearchParams(window.location.search);
  const requestedTopic = query.get("topic");
  const requestedSubject = query.get("subject");
  const requestedSessionType = query.get("session_type");

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      window.location.href = "/sign-in";
      return;
    }
    let a = true;
    completePosted.current = false;
    fetchingRef.current = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const preloadedRaw = window.sessionStorage.getItem(
          "preloaded_quiz_session",
        );
        if (preloadedRaw) {
          try {
            const preloaded = JSON.parse(preloadedRaw);
            if (
              preloaded?.session_id &&
              Array.isArray(preloaded?.questions) &&
              preloaded.questions.length > 0
            ) {
              setSessionId(preloaded.session_id);
              setQuestions(preloaded.questions || []);
              setTotal(
                preloaded.total_questions || preloaded.questions.length || 20,
              );
              window.sessionStorage.removeItem("preloaded_quiz_session");
              return;
            }
          } catch {}
          window.sessionStorage.removeItem("preloaded_quiz_session");
        }
        const parts = [];
        if (requestedTopic)
          parts.push(`topic=${encodeURIComponent(requestedTopic)}`);
        if (requestedSubject)
          parts.push(`subject=${encodeURIComponent(requestedSubject)}`);
        if (requestedSessionType)
          parts.push(
            `session_type=${encodeURIComponent(requestedSessionType)}`,
          );
        if (requestedTopic && !requestedSessionType)
          parts.push("session_type=topic_practice");
        const startPath = parts.length
          ? `/api/quiz/start/?${parts.join("&")}`
          : "/api/quiz/start/";
        const r = await apiFetch(startPath);
        if (!r.ok) throw new Error(await readErr(r, "Unable to start quiz."));
        const d = await r.json();
        if (!a) return;
        window.sessionStorage.setItem("quiz_in_progress", "1");
        setSessionId(d.session_id);
        setQuestions(d.questions || []);
        setTotal(d.total_questions || 20);
      } catch (e) {
        if (!a) return;
        if (
          e?.message === "missing_clerk_token" ||
          e?.message === "not_signed_in"
        ) {
          window.location.href = "/sign-in";
          return;
        }
        setError(e?.message || "Could not load quiz.");
      } finally {
        if (a) setLoading(false);
      }
    })();
    return () => {
      a = false;
    };
  }, [
    apiFetch,
    isLoaded,
    isSignedIn,
    requestedTopic,
    requestedSubject,
    requestedSessionType,
  ]);

  const [batchError, setBatchError] = useState(false);

  const fetchNextBatch = useCallback(async () => {
    if (!sessionId || questions.length >= total || fetchingRef.current) return;
    fetchingRef.current = true;
    setFetchingMore(true);
    setBatchError(false);
    try {
      const r = await apiFetch(`/api/quiz/session/${sessionId}/next-batch/`);
      if (!r.ok) throw new Error("Batch failed");
      const d = await r.json();
      if (d.questions?.length) {
        setQuestions((p) => [...p, ...d.questions]);
      } else {
        setBatchError(true);
      }
    } catch (e) {
      setBatchError(true);
    } finally {
      fetchingRef.current = false;
      setFetchingMore(false);
    }
  }, [apiFetch, sessionId, questions.length, total]);

  useEffect(() => {
    if (!sessionId || questions.length >= total || fetchingMore) return;
    if (current >= questions.length - 2) {
      fetchNextBatch();
    }
  }, [
    current,
    questions.length,
    sessionId,
    total,
    fetchingMore,
    fetchNextBatch,
  ]);

  useEffect(() => {
    if (!question || result || checking || summary) return;
    const t = setInterval(() => {
      setTimeLeft((p) => {
        if (p <= 1) {
          clearInterval(t);
          submitAnswer(null, TOTAL_TIME);
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [question, result, checking, summary]);

  const timerPct = Math.max(0, Math.min(1, timeLeft / TOTAL_TIME));
  const R = 28,
    C = 2 * Math.PI * R,
    off = C * (1 - timerPct);
  const domFail = useMemo(() => {
    const c = sessionResults.reduce((a, i) => {
      const k = i.failure_type || "correct";
      a[k] = (a[k] || 0) + 1;
      return a;
    }, {});
    let w = "none",
      m = 0;
    ["conceptual", "silly", "time", "recall"].forEach((k) => {
      if ((c[k] || 0) > m) {
        m = c[k];
        w = k;
      }
    });
    return w;
  }, [sessionResults]);

  const finalizeSession = useCallback(async () => {
    if (!sessionId || completePosted.current) return;
    completePosted.current = true;
    try {
      const r = await apiFetch(`/api/quiz/session/${sessionId}/complete/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!r.ok) return;
      const d = await r.json();
      if (d.summary) setSummary(d.summary);
    } catch {}
    window.sessionStorage.removeItem("quiz_in_progress");
  }, [apiFetch, sessionId]);

  const submitAnswer = async (opt, ft) => {
    if (!question || checking || result || !sessionId) return;
    setChecking(true);
    setSelected(opt);
    try {
      const r = await apiFetch("/api/quiz/answer/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          question_id: question.id,
          selected_option: opt,
          response_time: ft ?? TOTAL_TIME - timeLeft,
        }),
      });
      if (!r.ok) throw new Error(await readErr(r, "Answer submission failed."));
      const d = await r.json();
      setResult(d);
      setSessionXP((p) => p + (d.xp_delta || 0));
      setSessionResults((p) => [...p, d]);
      if (d.session_complete) {
        setSummary(d.session_summary || null);
        finalizeSession();
      }
    } catch (e) {
      setError(e?.message || "Could not submit answer.");
    } finally {
      setChecking(false);
    }
  };

  const nextQ = () => {
    if (current >= total - 1) {
      finalizeSession();
      if (!summary && result?.session_summary)
        setSummary(result.session_summary);
      return;
    }
    if (current >= questions.length - 1) {
      fetchNextBatch();
      return;
    }
    setCurrent((p) => p + 1);
    setSelected(null);
    setResult(null);
    setTimeLeft(TOTAL_TIME);
    setExpandExp(false);
  };

  useEffect(() => {
    if (!result || summary) return;
    if (current >= total - 1) return;
    if (current >= questions.length - 1) return;
    const t = setTimeout(() => {
      nextQ();
    }, 1200);
    return () => clearTimeout(t);
  }, [result, summary, current, total, questions.length, fetchingMore]);

  useEffect(() => {
    if (!result || summary) return;
    if (current !== total - 1) return;
    finalizeSession();
  }, [result, summary, current, total, finalizeSession]);

  if (loading)
    return (
      <AppShell activePath="/quiz">
        <div className="p-8 flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div
            className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mb-4"
            style={{
              borderColor: "var(--accent)",
              borderTopColor: "transparent",
            }}
          ></div>
          <h2 className="text-xl font-bold mb-2">Generating live quiz...</h2>
          <p style={{ color: "var(--text-muted)" }}>
            Please wait while the AI generates exam-specific questions for you.
            This may take up to a minute.
          </p>
        </div>
      </AppShell>
    );
  if (error)
    return (
      <AppShell activePath="/quiz">
        <div className="p-8">
          <p>{error}</p>
          {String(error).includes("subject or topic") && (
            <a
              href="/home"
              className="mt-3 inline-block underline"
              style={{ color: "var(--text-muted)" }}
            >
              Select subject/topic from Home
            </a>
          )}
        </div>
      </AppShell>
    );
  if (!question)
    return (
      <AppShell activePath="/quiz">
        <div className="p-8">No questions available.</div>
      </AppShell>
    );

  return (
    <AppShell activePath="/quiz">
      <div className="mx-auto max-w-[720px] px-4 py-8">
        <header className="mb-6 flex items-center justify-between gap-4">
          <p className="text-sm">
            Q {current + 1} / {total}
          </p>
          <div className="flex flex-1 gap-1.5 px-2">
            {Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                className="h-2 flex-1 rounded-full transition-colors"
                style={{
                  backgroundColor:
                    i <= current ? "var(--accent)" : "var(--border)",
                  opacity: i <= current ? 1 : 0.35,
                }}
              />
            ))}
          </div>
          <div
            className={`relative h-16 w-16 ${timeLeft < 10 && !result ? "anim-pulse-red" : ""}`}
          >
            <svg width="64" height="64" className="-rotate-90">
              <circle
                cx="32"
                cy="32"
                r={R}
                stroke="var(--border)"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="32"
                cy="32"
                r={R}
                stroke={
                  timeLeft < 10 ? "var(--dna-conceptual)" : "var(--accent)"
                }
                strokeWidth="6"
                fill="none"
                strokeDasharray={C}
                strokeDashoffset={off}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
              {timeLeft}s
            </span>
          </div>
        </header>

        <section
          className="rounded-3xl border p-6"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--surface)",
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <span
              className="rounded-full px-3 py-1 text-xs"
              style={{
                backgroundColor: "var(--surface-2)",
                color: "var(--text-muted)",
              }}
            >
              {question.topic}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const fill =
                  i <
                  Math.max(1, Math.round(Number(question.difficulty || 0) * 5));
                return (
                  <span
                    key={i}
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: fill
                        ? "var(--accent)"
                        : "var(--star-empty)",
                    }}
                  />
                );
              })}
            </div>
          </div>
          <h1 className="mb-5 text-lg leading-relaxed md:text-xl">
            {question.question_text}
          </h1>
          <div className="space-y-3">
            {(question.options || []).map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const disabled = checking || Boolean(result);
              const isSel = selected === idx;
              const isCorr = result && idx === Number(result.correct_answer);
              const isWrong = result && isSel && !result.is_correct;
              let bg = "var(--surface-2)",
                border = "var(--border)",
                tail = "";
              if (isCorr) {
                bg = "rgba(16,185,129,0.15)";
                border = "var(--dna-correct)";
                tail = " Correct";
              } else if (isWrong) {
                bg = "rgba(239,68,68,0.15)";
                border = "var(--dna-conceptual)";
                tail = " Incorrect";
              } else if (isSel && checking) {
                border = "var(--accent-2)";
                tail = "...";
              } else if (result) {
                bg = "var(--surface-3)";
                border = "var(--surface-3)";
              }
              return (
                <button
                  key={`${opt}-${idx}`}
                  onClick={() => submitAnswer(idx)}
                  disabled={disabled}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${isSel && checking ? "anim-checking" : ""}`}
                  style={{ backgroundColor: bg, borderColor: border }}
                >
                  <span
                    className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                    style={{ backgroundColor: "var(--bg)" }}
                  >
                    {letter}
                  </span>
                  {opt}
                  <span className="ml-2 text-xs">{tail}</span>
                </button>
              );
            })}
          </div>
        </section>

        {result && (
          <section
            className="anim-slide-up mt-4 rounded-3xl border p-5"
            style={{
              borderColor: result.is_correct
                ? "var(--dna-correct)"
                : "var(--dna-conceptual)",
              backgroundColor: result.is_correct
                ? "rgba(16,185,129,0.08)"
                : "rgba(239,68,68,0.08)",
            }}
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">
                {result.is_correct ? "Correct" : "Incorrect"}
              </p>
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: dnaColor(result.failure_type),
                  color: "#0f0f11",
                }}
              >
                {dnaLabel(result.failure_type)}
              </span>
            </div>
            <div className="mb-3 flex items-center justify-between text-sm">
              <p>
                XP:{" "}
                <span
                  style={{
                    color:
                      result.xp_delta >= 0
                        ? "var(--dna-correct)"
                        : "var(--dna-conceptual)",
                  }}
                >
                  {result.xp_delta >= 0
                    ? `+${result.xp_delta}`
                    : result.xp_delta}
                </span>
              </p>
              <p>Session: {sessionXP} XP</p>
            </div>
            <div className="mb-3">
              <p className="mb-1 text-xs">Ability</p>
              <div
                className="h-3 rounded-full"
                style={{ backgroundColor: "var(--border)" }}
              >
                <div
                  className="h-3 rounded-full transition-all"
                  style={{
                    width: `${Math.max(2, Number(result.new_ability || 0) * 100)}%`,
                    backgroundColor: "var(--accent)",
                  }}
                />
              </div>
              <p
                className="mt-1 text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                {Number(result.old_ability || 0).toFixed(2)} to{" "}
                {Number(result.new_ability || 0).toFixed(2)}
              </p>
            </div>
            <div
              className="mb-4 rounded-xl p-3"
              style={{ backgroundColor: "var(--surface-2)" }}
            >
              <p
                className="text-sm"
                style={
                  expandExp
                    ? undefined
                    : {
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }
                }
              >
                {result.explanation}
              </p>
              <button
                className="mt-2 text-xs underline"
                style={{ color: "var(--text-muted)" }}
                onClick={() => setExpandExp((v) => !v)}
              >
                {expandExp ? "Less" : "More"}
              </button>
            </div>
            {summary || current === total - 1 ? (
              <div
                className="rounded-2xl border p-4"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--surface)",
                }}
              >
                <h3 className="mb-2 text-lg font-semibold">Session Complete</h3>
                <p className="text-sm">
                  Score:{" "}
                  {summary?.correct ??
                    sessionResults.filter((r) => r.is_correct).length}
                  /{summary?.total_questions ?? total}
                </p>
                <p className="text-sm">XP: {summary?.xp_earned ?? sessionXP}</p>
                <p className="mb-3 text-sm">
                  Dominant: {toTitle(summary?.dominant_failure_type || domFail)}
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`/dna-report?session_id=${encodeURIComponent(sessionId)}`}
                    className="rounded-full px-4 py-2 text-sm font-semibold"
                    style={{
                      backgroundColor: "var(--accent)",
                      color: "var(--bg)",
                    }}
                  >
                    See Report
                  </a>
                  <a
                    href="/home"
                    className="rounded-full border px-4 py-2 text-sm"
                    style={{ borderColor: "var(--border)" }}
                  >
                    Quiz Again
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {batchError && (
                   <p className="text-xs text-red-500 text-center font-bold px-4">
                     Generation paused. Check connectivity and try clicking "Next Question" again.
                   </p>
                )}
                <button
                  onClick={nextQ}
                  disabled={fetchingMore && current >= questions.length - 1}
                  className="rounded-full px-8 py-4 text-sm font-black shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
                  style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}
                >
                  {fetchingMore && current >= questions.length - 1
                    ? "Generating next set..."
                    : "Next Question"}
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </AppShell>
  );
}
