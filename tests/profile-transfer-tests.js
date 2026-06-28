(function () {
  const { test, assertEqual } = window.OpenPCMTest;
  const Transfer = window.OpenPCMProfileTransfer;

  const source = {
    schemaVersion: "openpcm_profile_seed_v1",
    source: "test",
    profile: {
      cognition: { summary: "Systems thinker" },
      development_preferences: { preferred_workflow: { nickname: "Vibe coding" } }
    },
    knowledge: {
      features: { positive: { institutions: { weight: 10 } } }
    },
    media: {
      television: { loved: ["Andor"] }
    }
  };

  test("exportProfile creates portable PCM export", ["REQ-PROFILE-TRANSFER-001"], () => {
    const exported = Transfer.exportProfile(source, {
      exported_at_utc: "2026-01-01T00:00:00.000Z"
    });

    assertEqual(exported.schemaVersion, "openpcm_profile_export_v1");
    assertEqual(exported.profile.cognition.summary, "Systems thinker");
    assertEqual(exported.media.television.loved[0], "Andor");
  });

  test("validateProfileExport accepts valid export and rejects bad schema", ["REQ-PROFILE-TRANSFER-001"], () => {
    const exported = Transfer.exportProfile(source);
    assertEqual(Transfer.validateProfileExport(exported).ok, true);
    assertEqual(Transfer.validateProfileExport({ schemaVersion: "bad" }).ok, false);
  });

  test("importProfile replace mode replaces current source", ["REQ-PROFILE-TRANSFER-001"], () => {
    const exported = Transfer.exportProfile(source);
    const result = Transfer.importProfile({ profile: { old: true }, knowledge: {}, media: {} }, exported, { mode: "replace" });

    assertEqual(result.ok, true);
    assertEqual(result.mode, "replace");
    assertEqual(result.profileSource.profile.cognition.summary, "Systems thinker");
    assertEqual(result.profileSource.profile.old, undefined);
  });

  test("importProfile merge mode preserves current and adds incoming", ["REQ-PROFILE-TRANSFER-001"], () => {
    const exported = Transfer.exportProfile(source);
    const result = Transfer.importProfile({
      profile: { existing: { value: true } },
      knowledge: {},
      media: {}
    }, exported, { mode: "merge" });

    assertEqual(result.ok, true);
    assertEqual(result.profileSource.profile.existing.value, true);
    assertEqual(result.profileSource.profile.cognition.summary, "Systems thinker");
  });

  test("exportProfileText and parseProfileText round-trip", ["REQ-PROFILE-TRANSFER-001"], () => {
    const text = Transfer.exportProfileText(source);
    const parsed = Transfer.parseProfileText(text);

    assertEqual(parsed.ok, true);
    assertEqual(parsed.data.profile.development_preferences.preferred_workflow.nickname, "Vibe coding");
  });

  test("profileTransferSummary counts sections", ["REQ-PROFILE-TRANSFER-001"], () => {
    const summary = Transfer.profileTransferSummary(Transfer.exportProfile(source));
    assertEqual(summary.profileSections, 2);
    assertEqual(summary.knowledgeSections, 1);
    assertEqual(summary.mediaSections, 1);
  });
})();
