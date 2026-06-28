(function () {
  const { test, assertEqual } = window.OpenPCMTest;
  const Experiments = window.OpenPCMExperiments;

  const experiment = Experiments.defineExperiment({
    id: "ranking-v1",
    name: "Ranking V1",
    variants: [
      { id: "baseline", strategy: "baseline" },
      { id: "confidence", strategy: "confidence-weighted" },
      { id: "sources", strategy: "source-rich" }
    ]
  });

  const recommendations = [
    { title: "A", score: 70, explanation: { confidence: "High", sources: ["one", "two"] } },
    { title: "B", score: 72, explanation: { confidence: "Low", sources: [] } }
  ];

  test("defineExperiment normalizes experiment variants", ["REQ-EXPERIMENTS-001"], () => {
    assertEqual(experiment.id, "ranking-v1");
    assertEqual(experiment.variants.length, 3);
    assertEqual(experiment.variants[1].strategy, "confidence-weighted");
  });

  test("chooseVariant deterministically selects a variant", ["REQ-EXPERIMENTS-001"], () => {
    const first = Experiments.chooseVariant(experiment, "Counterpart");
    const second = Experiments.chooseVariant(experiment, "Counterpart");
    assertEqual(first.id, second.id);
  });

  test("applyVariant adjusts scores by strategy", ["REQ-EXPERIMENTS-001"], () => {
    const adjusted = Experiments.applyVariant(recommendations, {
      id: "confidence",
      name: "Confidence",
      strategy: "confidence-weighted",
      experimentId: "ranking-v1"
    });

    const a = adjusted.find(item => item.title === "A");
    const b = adjusted.find(item => item.title === "B");
    assertEqual(a.score, 75);
    assertEqual(b.score, 67);
    assertEqual(a.experiment.variantId, "confidence");
  });

  test("runExperiment returns selected variant and ranked recommendations", ["REQ-EXPERIMENTS-001", "REQ-DISCOVER-001"], () => {
    const result = Experiments.runExperiment(experiment, recommendations, "A");
    assertEqual(!!result.variant, true);
    assertEqual(result.recommendations.length, 2);
  });

  test("summarizeExperimentResult calculates feedback performance", ["REQ-EXPERIMENTS-001"], () => {
    const result = {
      experiment,
      variant: { id: "baseline" },
      recommendations
    };

    const summary = Experiments.summarizeExperimentResult(result, [
      { title: "A", value: 1 },
      { title: "B", value: -1 },
      { title: "C", value: 1 }
    ]);

    assertEqual(summary.feedbackCount, 2);
    assertEqual(summary.netFeedback, 0);
  });
})();
