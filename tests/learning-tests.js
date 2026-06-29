(function () {
  const { test, assertEqual } = window.OpenPCMTest;
  const Learning = window.OpenPCMLearning;

  const recommendations = [
    { title: "Counterpart", score: 80, reasons: ["institutional conflict", "competence under pressure"] },
    { title: "Weak Match", score: 60, reasons: ["weak plotting"] }
  ];

  test("classifyFeedback classifies positive neutral and negative", ["REQ-LEARNING-001"], () => {
    assertEqual(Learning.classifyFeedback({ value: 1 }), "positive");
    assertEqual(Learning.classifyFeedback({ value: 0 }), "neutral");
    assertEqual(Learning.classifyFeedback({ value: -1 }), "negative");
  });

  test("buildLearningProfile identifies confirmed matches and false positives", ["REQ-LEARNING-001"], () => {
    const profile = Learning.buildLearningProfile([
      { title: "Counterpart", value: 1 },
      { title: "Weak Match", value: -1 }
    ], recommendations);

    assertEqual(profile.confirmedMatches.length, 1);
    assertEqual(profile.falsePositives.length, 1);
    assertEqual(profile.signalAdjustments["institutional conflict"], 1);
    assertEqual(profile.signalAdjustments["weak plotting"], -1);
  });

  test("applyLearningAdjustments changes recommendation scores from learned signals", ["REQ-LEARNING-001", "REQ-DISCOVER-001"], () => {
    const profile = Learning.buildLearningProfile([
      { title: "Counterpart", value: 1 },
      { title: "Weak Match", value: -1 }
    ], recommendations);

    const adjusted = Learning.applyLearningAdjustments(recommendations, profile);
    const counterpart = adjusted.find(item => item.title === "Counterpart");
    const weak = adjusted.find(item => item.title === "Weak Match");

    assertEqual(counterpart.score, 90);
    assertEqual(weak.score, 55);
  });

  test("learningSummaryText summarizes feedback", ["REQ-LEARNING-001"], () => {
    const text = Learning.learningSummaryText({
      summary: { totalFeedback: 2, confirmedMatches: 1, falsePositives: 1 }
    });
    assertEqual(text, "2 feedback items · 1 confirmed · 1 false positives");
  });

  test("feedbackRecencyMultiplier boosts recent feedback and decays old feedback", ["REQ-LEARNING-002"], () => {
    const options = { now: "2026-06-29T00:00:00Z" };
    assertEqual(Learning.feedbackRecencyMultiplier({ timestamp_utc: "2026-06-20T00:00:00Z" }, options), 1.3);
    assertEqual(Learning.feedbackRecencyMultiplier({ timestamp_utc: "2025-01-01T00:00:00Z" }, options), 0.65);
  });

  test("buildLearningProfile detects emerging interests and stale signals", ["REQ-LEARNING-002"], () => {
    const profile = Learning.buildLearningProfile([
      { title: "Counterpart", value: 1, timestamp_utc: "2026-06-20T00:00:00Z" },
      { title: "Old Match", value: 1, timestamp_utc: "2025-01-01T00:00:00Z" }
    ], [
      ...recommendations,
      { title: "Old Match", score: 70, reasons: ["slow burn"] }
    ], { now: "2026-06-29T00:00:00Z" });

    assertEqual(profile.schemaVersion, "openpcm_learning_profile_v2");
    assertEqual(profile.emergingInterests.some(signal => signal.signal === "institutional conflict"), true);
    assertEqual(profile.staleSignals.some(signal => signal.signal === "slow burn"), true);
    assertEqual(profile.summary.emergingInterests >= 1, true);
    assertEqual(profile.summary.staleSignals, 1);
  });

  test("applyLearningAdjustments returns inspectable learning explanations", ["REQ-LEARNING-002"], () => {
    const profile = Learning.buildLearningProfile([
      { title: "Counterpart", value: 1, timestamp_utc: "2026-06-20T00:00:00Z" },
      { title: "Weak Match", value: -1, timestamp_utc: "2026-06-20T00:00:00Z" }
    ], recommendations, { now: "2026-06-29T00:00:00Z" });

    const adjusted = Learning.applyLearningAdjustments(recommendations, profile);
    const counterpart = adjusted.find(item => item.title === "Counterpart");
    const weak = adjusted.find(item => item.title === "Weak Match");

    assertEqual(counterpart.learningExplanation.headline, "Boosted by feedback from recommendations you accepted.");
    assertEqual(counterpart.learningDetails.signals.length, 2);
    assertEqual(counterpart.learningDetails.emergingInterests.includes("institutional conflict"), true);
    assertEqual(weak.learningDetails.headline, "Reduced by feedback from recommendations you rejected.");
  });

  test("feedbackWeight applies direction strength recency and explicit reason", ["REQ-LEARNING-002"], () => {
    const weight = Learning.feedbackWeight({
      title: "New Hit",
      value: 2,
      reason: "Exactly the right pressure.",
      timestamp_utc: "2026-06-20T00:00:00Z"
    }, { now: "2026-06-29T00:00:00Z" });

    assertEqual(weight, 2.86);
  });

  test("buildLearningProfile surfaces weighted adjustments emerging interests and stale signals", ["REQ-LEARNING-002"], () => {
    const profile = Learning.buildLearningProfile([
      { title: "Counterpart", value: 2, timestamp_utc: "2026-06-20T00:00:00Z" },
      { title: "Old Favourite", value: 1, timestamp_utc: "2025-06-01T00:00:00Z" }
    ], [
      ...recommendations,
      { title: "Old Favourite", score: 70, reasons: ["quiet competence"] }
    ], { now: "2026-06-29T00:00:00Z" });

    assertEqual(profile.weightedSignalAdjustments["institutional conflict"], 2.6);
    assertEqual(profile.emergingInterests[0].signal, "competence under pressure");
    assertEqual(profile.staleSignals[0].signal, "quiet competence");
  });

  test("applyLearningAdjustments can use weighted feedback and explain the adjustment", ["REQ-LEARNING-002", "REQ-FIRST-INTELLIGENCE-002"], () => {
    const profile = Learning.buildLearningProfile([
      { title: "Counterpart", value: 2, timestamp_utc: "2026-06-20T00:00:00Z" },
      { title: "Weak Match", value: -1, timestamp_utc: "2026-06-20T00:00:00Z" }
    ], recommendations, { now: "2026-06-29T00:00:00Z" });

    const adjusted = Learning.applyLearningAdjustments(recommendations, profile, { weighted: true });
    const counterpart = adjusted.find(item => item.title === "Counterpart");
    const weak = adjusted.find(item => item.title === "Weak Match");

    assertEqual(counterpart.learningAdjustment, 21);
    assertEqual(counterpart.score, 100);
    assertEqual(counterpart.learningExplanation.headline, "Boosted by feedback from recommendations you accepted.");
    assertEqual(weak.learningAdjustment, -5);
    assertEqual(weak.score, 55);
  });



  test("learningInsightCards surfaces emerging stale and false-positive actions", ["REQ-LEARNING-002"], () => {
    const profile = Learning.buildLearningProfile([
      { title: "Counterpart", value: 1, timestamp_utc: "2026-06-20T00:00:00Z" },
      { title: "Weak Match", value: -1, timestamp_utc: "2026-06-20T00:00:00Z" },
      { title: "Old Match", value: 1, timestamp_utc: "2025-01-01T00:00:00Z" }
    ], [
      ...recommendations,
      { title: "Old Match", score: 70, reasons: ["slow burn"] }
    ], { now: "2026-06-29T00:00:00Z" });

    const cards = Learning.learningInsightCards(profile);
    assertEqual(cards.some(card => card.type === "emerging_interest"), true);
    assertEqual(cards.some(card => card.type === "false_positive"), true);
    assertEqual(cards.some(card => card.type === "stale_signal"), true);
  });
})();
