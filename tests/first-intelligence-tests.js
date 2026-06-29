(function () {
  const { test, assertEqual } = window.OpenPCMTest;
  const First = window.OpenPCMFirstIntelligence;

  const evidence = [
    { title: "Andor", medium: "TV", reaction: "Loved", tags: ["politics", "competence"], note: "Excellent", timestamp_utc: "2026-06-25T00:00:00Z" },
    { title: "Black Sails", medium: "TV", reaction: "Liked", tags: ["politics", "ensemble"], timestamp_utc: "2026-04-01T00:00:00Z" },
    { title: "Slow Show", medium: "TV", reaction: "Bounced", tags: ["slow"], timestamp_utc: "2026-06-20T00:00:00Z" }
  ];

  test("buildWeightedSignals applies reaction and recency weighting", ["REQ-FIRST-INTELLIGENCE-001"], () => {
    const weighted = First.buildWeightedSignals(evidence, { now: "2026-06-29T00:00:00Z" });
    const politics = weighted.tags.find(signal => signal.signal === "politics");
    const slow = weighted.tags.find(signal => signal.signal === "slow");
    assertEqual(politics.weight > 8, true);
    assertEqual(slow.weight < 0, true);
    assertEqual(weighted.summary.evidenceCount, 3);
  });

  test("scoreCandidate returns score, confidence, matches, and risks", ["REQ-FIRST-INTELLIGENCE-001"], () => {
    const weighted = First.buildWeightedSignals(evidence, { now: "2026-06-29T00:00:00Z" });
    const scored = First.scoreCandidate({ title: "Counterpart", medium: "TV", tags: ["politics", "competence"] }, weighted);
    assertEqual(scored.score > 70, true);
    assertEqual(scored.confidence, "High");
    assertEqual(scored.matches.some(signal => signal.signal === "politics"), true);
  });

  test("rankRecommendations provides explainable ordered recommendations", ["REQ-FIRST-INTELLIGENCE-001", "REQ-FIRST-INTELLIGENCE-002"], () => {
    const ranked = First.rankRecommendations([
      { title: "Weak", medium: "Book", tags: ["ensemble"] },
      { title: "Strong", medium: "TV", tags: ["politics", "competence"] },
      { title: "Risky", medium: "TV", tags: ["slow"] }
    ], evidence, { now: "2026-06-29T00:00:00Z" });

    assertEqual(ranked[0].title, "Strong");
    assertEqual(ranked[0].explanation.evidence.length >= 2, true);
    assertEqual(ranked.some(item => item.title === "Risky"), false);
  });
})();
