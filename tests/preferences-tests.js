(function () {
  const { test, assertEqual } = window.OpenPCMTest;
  const Preferences = window.OpenPCMPreferences;

  const profileSource = {
    knowledge: {
      features: {
        positive: {
          institutional_conflict: { weight: 10, confidence: 10 },
          competence_under_pressure: { weight: 9, confidence: 9 }
        },
        negative: {
          weak_plotting: { weight: -10, confidence: 10 }
        }
      }
    }
  };

  test("buildPreferenceModel merges PCM profile and OpenPCM evidence", ["REQ-PREFERENCES-001"], () => {
    const model = Preferences.buildPreferenceModel(profileSource, [
      { title: "Andor", reaction: "Loved", medium: "TV", tags: ["institutions", "competence"] }
    ]);

    assertEqual(model.schemaVersion, "openpcm_preference_model_v1");
    assertEqual(model.positive.some(signal => signal.key === "institutional conflict"), true);
    assertEqual(model.positive.some(signal => signal.key === "institutions"), true);
  });

  test("buildPreferenceModel records negative signals", ["REQ-PREFERENCES-001"], () => {
    const model = Preferences.buildPreferenceModel(profileSource, [
      { title: "Bad Show", reaction: "Bounced", medium: "TV", tags: ["too slow"] }
    ]);

    assertEqual(model.negative.some(signal => signal.key === "weak plotting"), true);
    assertEqual(model.negative.some(signal => signal.key === "too slow"), true);
  });

  test("topPreferenceTags returns strongest positive preferences", ["REQ-PREFERENCES-001"], () => {
    const model = Preferences.buildPreferenceModel(profileSource, []);
    const tags = Preferences.topPreferenceTags(model, 1);
    assertEqual(tags[0], "institutional conflict");
  });

  test("signalWeight returns merged signal weight", ["REQ-PREFERENCES-001"], () => {
    const model = Preferences.buildPreferenceModel(profileSource, []);
    assertEqual(Preferences.signalWeight(model, "institutional conflict"), 20);
  });
})();
