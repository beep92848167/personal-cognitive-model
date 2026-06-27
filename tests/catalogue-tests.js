(function () {
  const { test, assertEqual } = window.OpenPCMTest;
  const Catalogue = window.OpenPCMCatalogue;

  const profileSource = {
    knowledge: {
      features: {
        positive: {
          institutional_conflict: { weight: 10, confidence: 10 },
          competence_under_pressure: { weight: 9, confidence: 9 }
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
      television: {
        loved: ["Andor"],
        bounced_or_disliked: [{ title: "Silo", reason: "too slow" }],
        comfort_rewatches: ["Veep"]
      },
      movies: {
        loved_or_liked: ["The Big Short"],
        recommended_unwatched_or_unknown: ["Michael Clayton"]
      },
      novels: {
        loved_or_liked: ["A Memory Called Empire"]
      },
      games: {
        liked: ["Cities: Skylines"]
      },
      documentaries: {
        liked: ["The Fog of War"]
      },
      comedy: {
        comfort: ["Yes Minister"]
      },
      integrated_m2m: {
        recommended: ["The Expanse"]
      }
    }
  };

  test("buildCatalogue ingests all PCM media modules", ["REQ-CATALOGUE-001"], () => {
    const catalogue = Catalogue.buildCatalogue(profileSource);
    assertEqual(catalogue.some(item => item.title === "Counterpart"), true);
    assertEqual(catalogue.some(item => item.title === "A Memory Called Empire"), true);
    assertEqual(catalogue.some(item => item.title === "Cities: Skylines"), true);
    assertEqual(catalogue.some(item => item.title === "The Fog of War"), true);
    assertEqual(catalogue.some(item => item.title === "Yes Minister"), true);
    assertEqual(catalogue.some(item => item.title === "The Expanse"), true);
  });

  test("buildCatalogue deduplicates titles and preserves sources", ["REQ-CATALOGUE-001"], () => {
    const catalogue = Catalogue.buildCatalogue({
      knowledge: { features: { positive: {} }, recommendations: { current: { tv: ["Andor"] } } },
      media: { television: { loved: ["Andor"] } }
    });
    const andor = catalogue.find(item => item.title === "Andor");
    assertEqual(catalogue.filter(item => item.title === "Andor").length, 1);
    assertEqual(andor.sources.length, 2);
  });

  test("catalogueSummary counts media and statuses", ["REQ-CATALOGUE-001"], () => {
    const summary = Catalogue.catalogueSummary([
      { medium: "TV", catalogueStatus: "known-positive" },
      { medium: "TV", catalogueStatus: "candidate" },
      { medium: "Book", catalogueStatus: "candidate" }
    ]);
    assertEqual(summary.total, 3);
    assertEqual(summary.byMedium.TV, 2);
    assertEqual(summary.byStatus.candidate, 2);
  });

  test("profile candidate catalogue uses full catalogue and excludes known negatives", ["REQ-CATALOGUE-001", "REQ-PROFILE-001"], () => {
    const candidates = window.OpenPCMProfile.buildCandidateCatalogue(profileSource);
    assertEqual(candidates.some(item => item.title === "Michael Clayton"), true);
    assertEqual(candidates.some(item => item.title === "Silo"), false);
  });
})();
