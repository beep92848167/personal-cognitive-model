(function () {
  const { test, assertEqual } = window.OpenPCMTest;
  const Reasoning = window.OpenPCMReasoning;
  const Preferences = window.OpenPCMPreferences;

  const model = Preferences.buildPreferenceModel({
    knowledge: {
      features: {
        positive: {
          institutional_conflict: { weight: 10, confidence: 10 },
          competence_under_pressure: { weight: 8, confidence: 8 }
        },
        negative: {
          weak_plotting: { weight: -10, confidence: 10 }
        }
      }
    }
  }, [
    { title: "Andor", reaction: "Loved", medium: "TV", tags: ["institutions"] },
    { title: "Bad Show", reaction: "Bounced", medium: "TV", tags: ["weak plotting"] }
  ]);

  test("evaluateCandidate produces supporting evidence and confidence", ["REQ-REASONING-001"], () => {
    const result = Reasoning.evaluateCandidate({
      title: "Counterpart",
      medium: "TV",
      tags: ["institutional conflict", "competence under pressure"],
      catalogueStatus: "recommended",
      sources: ["pcm:knowledge.recommendations.current.tv"]
    }, model);

    assertEqual(result.score > 0, true);
    assertEqual(result.confidence, "High");
    assertEqual(result.supportingEvidence.length >= 2, true);
    assertEqual(result.sources[0], "pcm:knowledge.recommendations.current.tv");
  });

  test("evaluateCandidate records conflicting evidence", ["REQ-REASONING-001"], () => {
    const result = Reasoning.evaluateCandidate({
      title: "Risky",
      medium: "TV",
      tags: ["weak plotting"]
    }, model);

    assertEqual(result.conflictingEvidence[0].signal, "weak plotting");
    assertEqual(result.confidence, "Medium");
  });

  test("reasonAboutCatalogue sorts candidates by reasoning score", ["REQ-REASONING-001"], () => {
    const results = Reasoning.reasonAboutCatalogue([
      { title: "Weak", medium: "TV", tags: ["institutions"] },
      { title: "Strong", medium: "TV", tags: ["institutional conflict", "competence under pressure"], catalogueStatus: "recommended" }
    ], model);

    assertEqual(results[0].candidate.title, "Strong");
  });

  test("buildRecommendationFromReasoning creates Discover-compatible recommendation", ["REQ-REASONING-001", "REQ-DISCOVER-001"], () => {
    const item = Reasoning.reasonAboutCatalogue([
      { title: "Strong", medium: "TV", tags: ["institutional conflict"], sources: ["pcm:test"] }
    ], model)[0];

    const rec = Reasoning.buildRecommendationFromReasoning(item);
    assertEqual(rec.title, "Strong");
    assertEqual(rec.explanation.confidence === "High" || rec.explanation.confidence === "Medium", true);
  });
})();
