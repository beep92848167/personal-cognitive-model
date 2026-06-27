(function () {
  const { test, assertEqual } = window.OpenPCMTest;
  const Profile = window.OpenPCMProfile;

  const source = {
    profile: {
      development_preferences: {
        summary: "Enjoys collaborative AI pair programming.",
        preferred_workflow: {
          style: "Collaborative AI pair programming",
          nickname: "Vibe coding"
        },
        preferred_ai_partner: {
          role: "Senior engineering partner"
        },
        preferred_protocols: {
          sync: {},
          dot: {},
          sync_dot: {},
          u_sync: {}
        },
        engineering_values: {
          prefer_clean_architecture: true,
          prefer_high_test_coverage: true
        },
        session_preferences: {
          enjoys_long_engineering_sessions: true,
          prefers_ai_to_take_initiative: true
        }
      }
    }
  };

  test("developmentPreferencesSummary exposes vibe coding workflow preferences", ["REQ-PROFILE-002"], () => {
    const summary = Profile.developmentPreferencesSummary(source);
    assertEqual(summary.workflowStyle, "Collaborative AI pair programming");
    assertEqual(summary.nickname, "Vibe coding");
    assertEqual(summary.aiPartnerRole, "Senior engineering partner");
    assertEqual(summary.protocols.includes("sync_dot"), true);
  });

  test("developmentPreferencesSummary lists enabled engineering and session preferences", ["REQ-PROFILE-002"], () => {
    const summary = Profile.developmentPreferencesSummary(source);
    assertEqual(summary.engineeringValues.includes("Clean Architecture"), true);
    assertEqual(summary.engineeringValues.includes("High Test Coverage"), true);
    assertEqual(summary.sessionPreferences.includes("Enjoys Long Engineering Sessions"), true);
  });

  test("PCM seed includes development preferences", ["REQ-PROFILE-002"], () => {
    const summary = Profile.developmentPreferencesSummary(window.OpenPCMProfileSeed);
    assertEqual(summary.nickname, "Vibe coding");
    assertEqual(summary.protocols.includes("sync_dot"), true);
  });
})();
