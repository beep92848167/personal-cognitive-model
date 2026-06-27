(function () {
  const { test, assertEqual } = window.OpenPCMTest;
  const Profile = window.OpenPCMProfile;

  const source = {
    profile: {
      cognition: { summary: "Systems thinker." },
      daily_capacity: { rule: "Consider cognitive fit." }
    },
    knowledge: {
      features: {
        positive: {
          institutional_conflict: { weight: 10, confidence: 10 },
          competence_under_pressure: { weight: 9, confidence: 9 }
        },
        negative: {
          weak_plotting: { weight: -10, confidence: 10 }
        }
      },
      recommendations: {
        current: {
          tv: ["Counterpart"],
          books_low_load: ["All Systems Red"],
          games_ps5: ["Balatro"]
        }
      }
    },
    media: {
      movies: {
        recommended_unwatched_or_unknown: ["Michael Clayton"],
        loved_or_liked: ["The Big Short"]
      },
      television: {
        loved: ["Andor"],
        bounced_or_disliked: [{ title: "Silo", reason: "too slow" }],
        comfort_rewatches: ["Veep"]
      }
    }
  };

  test("profileSummary extracts cognitive and feature signals", ["REQ-PROFILE-001"], () => {
    const summary = Profile.profileSummary(source);
    assertEqual(summary.cognition, "Systems thinker.");
    assertEqual(summary.positiveSignals[0].label, "Institutional Conflict");
    assertEqual(summary.negativeSignals[0].label, "Weak Plotting");
  });

  test("buildCandidateCatalogue creates recommendation candidates from PCM data", ["REQ-PROFILE-001", "REQ-DISCOVER-001"], () => {
    const candidates = Profile.buildCandidateCatalogue(source);
    assertEqual(candidates.some(candidate => candidate.title === "Counterpart"), true);
    assertEqual(candidates.some(candidate => candidate.title === "Michael Clayton"), true);
  });

  test("buildEvidenceFromProfile turns loved and disliked media into evidence", ["REQ-PROFILE-001", "REQ-DISCOVER-001"], () => {
    const evidence = Profile.buildEvidenceFromProfile(source);
    assertEqual(evidence.some(entry => entry.title === "Andor" && entry.reaction === "Loved"), true);
    assertEqual(evidence.some(entry => entry.title === "Silo" && entry.reaction === "Bounced"), true);
  });
})();
