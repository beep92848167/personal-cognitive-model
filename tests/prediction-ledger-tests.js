(function () {
  const { test, assertEqual } = window.OpenPCMTest;
  const Ledger = window.OpenPCMPredictionLedger;

  const recommendations = [
    { title: "Counterpart", medium: "TV", score: 88, confidence: "High", confidencePercent: 82, matches: ["institutional conflict", "competence"], risks: ["slow pacing"] },
    { title: "Weak Match", medium: "TV", score: 72, confidence: "Medium", confidencePercent: 55, matches: ["politics"], risks: [] },
    { title: "No Feedback Yet", medium: "Book", score: 61, confidence: "Low", matches: ["ensemble"] }
  ];

  test("normalizePrediction records predicted score confidence and signals", ["REQ-PREDICTION-LEDGER-001"], () => {
    const prediction = Ledger.normalizePrediction(recommendations[0], { id: "p1", timestamp_utc: "2026-06-29T00:00:00Z" });
    assertEqual(prediction.id, "p1");
    assertEqual(prediction.title, "Counterpart");
    assertEqual(prediction.predictedScore, 88);
    assertEqual(prediction.predictedReaction, "loved");
    assertEqual(prediction.confidence, "High");
    assertEqual(prediction.reasons.length, 2);
    assertEqual(prediction.outcome, "pending");
  });

  test("attachOutcome stores actual reaction prediction error and mismatch reason", ["REQ-PREDICTION-LEDGER-001"], () => {
    const prediction = Ledger.normalizePrediction(recommendations[1], { id: "p2" });
    const outcome = Ledger.attachOutcome(prediction, { reaction: "Bounced", reason: "Too procedural", timestamp_utc: "2026-06-30T00:00:00Z" });
    assertEqual(outcome.actualScore, 25);
    assertEqual(outcome.predictionError, -47);
    assertEqual(outcome.outcome, "major_miss");
    assertEqual(outcome.mismatchReason, "Too procedural");
  });

  test("buildPredictionLedger joins recommendations with feedback by title", ["REQ-PREDICTION-LEDGER-001"], () => {
    const ledger = Ledger.buildPredictionLedger(recommendations, [
      { title: "Counterpart", reaction: "Liked" },
      { title: "Weak Match", actualScore: 40, reason: "Wrong texture" }
    ], { id: "batch" });

    assertEqual(ledger.length, 3);
    assertEqual(ledger[0].id, "batch-1");
    assertEqual(ledger[0].predictionError, -8);
    assertEqual(ledger[1].predictionError, -32);
    assertEqual(ledger[2].outcome, "pending");
  });

  test("ledgerSummary reports calibration and pending feedback", ["REQ-PREDICTION-LEDGER-002"], () => {
    const ledger = Ledger.buildPredictionLedger(recommendations, [
      { title: "Counterpart", actualScore: 90 },
      { title: "Weak Match", actualScore: 40 }
    ]);
    const summary = Ledger.ledgerSummary(ledger);

    assertEqual(summary.total, 3);
    assertEqual(summary.completed, 2);
    assertEqual(summary.pending, 1);
    assertEqual(summary.majorMisses, 1);
    assertEqual(summary.calibration, "Needs more feedback");
  });

  test("signalPredictionErrors groups average error by matched signals", ["REQ-PREDICTION-LEDGER-002"] , () => {
    const ledger = Ledger.buildPredictionLedger(recommendations, [
      { title: "Counterpart", actualScore: 90 },
      { title: "Weak Match", actualScore: 40 }
    ]);
    const signals = Ledger.signalPredictionErrors(ledger);
    const politics = signals.find(signal => signal.signal === "politics");

    assertEqual(politics.count, 1);
    assertEqual(politics.averageError, -32);
    assertEqual(signals[0].signal, "politics");
  });

  test("predictionLedgerInsights surfaces feedback and calibration actions", ["REQ-PREDICTION-LEDGER-002"], () => {
    const ledger = Ledger.buildPredictionLedger(recommendations, [
      { title: "Counterpart", actualScore: 90 },
      { title: "Weak Match", actualScore: 40 }
    ]);
    const cards = Ledger.predictionLedgerInsights(ledger);

    assertEqual(cards.some(card => card.type === "pending_feedback"), true);
    assertEqual(cards.some(card => card.type === "calibration_gap"), true);
  });

  test("saveLedger and loadLedger round-trip prediction outcomes", ["REQ-PREDICTION-LEDGER-001"], () => {
    const storage = { data: {}, getItem(key) { return this.data[key] || null; }, setItem(key, value) { this.data[key] = value; } };
    Ledger.saveLedger([{ id: "p1", outcome: "accurate" }], storage, "ledger");
    assertEqual(Ledger.loadLedger(storage, "ledger")[0].outcome, "accurate");
  });
})();
