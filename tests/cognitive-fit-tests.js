(function () {
  const { test, assert, assertEqual } = window.OpenPCMTest;
  const fit = window.OpenPCMCognitiveFit;

  test("normalizeState maps cognitive state labels", ["REQ-COGNITIVE-FIT-001"], () => {
    assertEqual(fit.normalizeState("High capacity"), "high");
    assertEqual(fit.normalizeState("Evening / low load"), "low");
    assertEqual(fit.normalizeState("Symptom flare / recovery"), "flare");
    assertEqual(fit.normalizeState("unknown"), "medium");
  });

  test("scoreCognitiveFit penalizes demanding candidates during flare", ["REQ-COGNITIVE-FIT-001", "REQ-COGNITIVE-FIT-002"], () => {
    const result = fit.scoreCognitiveFit({
      title: "Dense Political Thriller",
      tags: ["complex", "subtitles", "brutal"]
    }, "Symptom flare / recovery");

    assert(result.score < 50, "flare state should strongly penalize demanding candidates");
    assertEqual(result.label, "Save for later");
    assert(result.avoidMatches.includes("complex"), "should explain avoid-match signal");
  });

  test("scoreCognitiveFit boosts comfort candidates during low capacity", ["REQ-COGNITIVE-FIT-001", "REQ-COGNITIVE-FIT-002"], () => {
    const result = fit.scoreCognitiveFit({
      title: "Gentle Comfort Show",
      tags: ["comfort", "familiar", "kids", "short"]
    }, "Low capacity");

    assert(result.score >= 80, "comfort candidates should fit low capacity");
    assertEqual(result.label, "Good fit now");
    assert(result.preferredMatches.includes("comfort"), "should expose preferred signal");
  });

  test("applyCognitiveFit re-ranks recommendations by current capacity", ["REQ-COGNITIVE-FIT-002"], () => {
    const recommendations = [
      { title: "Dense Epic", score: 90, candidate: { title: "Dense Epic", tags: ["complex", "subtitles"] } },
      { title: "Comfort Episode", score: 75, candidate: { title: "Comfort Episode", tags: ["comfort", "familiar", "short"] } }
    ];

    const ranked = fit.applyCognitiveFit(recommendations, "Low capacity");

    assertEqual(ranked[0].title, "Comfort Episode");
    assert(ranked[0].adjustedScore > ranked[1].adjustedScore, "capacity fit should influence ranking");
    assert(ranked[0].explanation.cognitiveFit.includes("Low capacity"), "should attach explanation text");
  });

  test("cognitiveFitInsights surfaces good-now and save-later cards", ["REQ-COGNITIVE-FIT-003"], () => {
    const recommendations = fit.applyCognitiveFit([
      { title: "Comfort Episode", score: 80, candidate: { title: "Comfort Episode", tags: ["comfort", "familiar"] } },
      { title: "Stressful Epic", score: 85, candidate: { title: "Stressful Epic", tags: ["complex", "stressful"] } }
    ], "Symptom flare / recovery");

    const cards = fit.cognitiveFitInsights(recommendations, "Symptom flare / recovery");

    assert(cards.some(card => card.type === "good_now"), "should show a current-fit card");
    assert(cards.some(card => card.type === "save_for_later"), "should show save-for-later warnings");
  });
})();
