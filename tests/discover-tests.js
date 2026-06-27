(function () {
  const { test, assertEqual, assertDeepEqual } = window.OpenPCMTest;
  const Discover = window.OpenPCMDiscover;

  const evidence = [
    { title: "Black Sails", medium: "TV", reaction: "Loved", tags: ["institutions", "competence", "ensemble cast"] },
    { title: "Andor", medium: "TV", reaction: "Loved", tags: ["institutions", "political systems", "competence"] },
    { title: "Slow Show", medium: "TV", reaction: "Bounced", tags: ["too slow"] }
  ];

  test("buildPreferenceProfile weights positive and negative evidence", ["REQ-DISCOVER-001"], () => {
    const profile = Discover.buildPreferenceProfile(evidence);
    assertEqual(profile.tags.institutions, 8);
    assertEqual(profile.tags.competence, 8);
    assertEqual(profile.tags["too slow"], -3);
    assertEqual(profile.media.tv > 0, true);
  });

  test("scoreCandidate rewards matched positive preference tags", ["REQ-DISCOVER-001"], () => {
    const result = Discover.scoreCandidate(
      { title: "Candidate", medium: "TV", tags: ["institutions", "competence"] },
      evidence
    );
    assertEqual(result.score > 80, true);
    assertDeepEqual(result.matchedReasons.map(reason => reason.tag).slice(0, 2), ["competence", "institutions"]);
  });

  test("scoreCandidate records risk signals", ["REQ-DISCOVER-001"], () => {
    const result = Discover.scoreCandidate(
      { title: "Risky Candidate", medium: "TV", tags: ["too slow"] },
      evidence
    );
    assertEqual(result.risks[0].tag, "too slow");
  });

  test("rankCandidates excludes already captured titles and sorts by score", ["REQ-DISCOVER-001"], () => {
    const ranked = Discover.rankCandidates([
      { title: "Black Sails", medium: "TV", tags: ["institutions"] },
      { title: "Strong Match", medium: "TV", tags: ["institutions", "competence"] },
      { title: "Weak Match", medium: "Book", tags: ["ensemble cast"] }
    ], evidence);

    assertEqual(ranked[0].title, "Strong Match");
    assertEqual(ranked.some(item => item.title === "Black Sails"), false);
  });

  test("buildDiscoverSummary returns top tags and recommendations", ["REQ-DISCOVER-001"], () => {
    const summary = Discover.buildDiscoverSummary(evidence, [
      { title: "Strong Match", medium: "TV", tags: ["institutions", "competence"] }
    ]);

    assertEqual(summary.topTags.includes("institutions"), true);
    assertEqual(summary.recommendations[0].title, "Strong Match");
  });
})();
