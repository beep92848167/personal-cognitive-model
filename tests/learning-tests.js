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
})();
