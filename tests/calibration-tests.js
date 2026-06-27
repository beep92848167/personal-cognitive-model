(function () {
  const { test, assertEqual } = window.OpenPCMTest;
  const Calibration = window.OpenPCMCalibration;

  test("normalizeFeedback creates stable title key and bounded value", ["REQ-CALIBRATION-001"], () => {
    const result = Calibration.normalizeFeedback({ title: "  Counterpart  ", value: 5, note: " good " });
    assertEqual(result.title, "Counterpart");
    assertEqual(result.key, "counterpart");
    assertEqual(result.value, 1);
    assertEqual(result.note, "good");
  });

  test("upsertFeedback replaces feedback for same title", ["REQ-CALIBRATION-001"], () => {
    const result = Calibration.upsertFeedback(
      [{ title: "Counterpart", value: 1 }],
      { title: "counterpart", value: -1 }
    );
    assertEqual(result.length, 1);
    assertEqual(result[0].value, -1);
  });

  test("applyFeedback adjusts and resorts recommendations", ["REQ-CALIBRATION-001", "REQ-DISCOVER-001"], () => {
    const result = Calibration.applyFeedback(
      [
        { title: "A", score: 70 },
        { title: "B", score: 60 }
      ],
      [
        { title: "B", value: 1 },
        { title: "A", value: -1 }
      ]
    );

    assertEqual(result[0].title, "B");
    assertEqual(result[0].score, 75);
    assertEqual(result[1].score, 55);
  });

  test("saveFeedback and loadFeedback round-trip through storage", ["REQ-CALIBRATION-001"], () => {
    const storage = {
      data: {},
      getItem(key) { return this.data[key] || null; },
      setItem(key, value) { this.data[key] = value; }
    };

    Calibration.saveFeedback([{ title: "Counterpart", value: 1 }], storage, "feedback");
    const loaded = Calibration.loadFeedback(storage, "feedback");
    assertEqual(loaded.length, 1);
    assertEqual(loaded[0].title, "Counterpart");
  });
})();
