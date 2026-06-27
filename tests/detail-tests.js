(function () {
  const { test, assert, assertEqual } = window.OpenPCMTest;
  const Detail = window.OpenPCMDetail;

  const fixedDate = () => "2026-01-02 03:04";

  test("buildDetailViewModel maps evidence into detail view data", ["REQ-LIBRARY-004"], () => {
    const model = Detail.buildDetailViewModel({
      id: "entry-1",
      medium: "TV",
      title: "Black Sails",
      reaction: "Loved",
      cognitive_state: "High capacity",
      tags: ["institutions", "competence"],
      note: "State failure done well.",
      timestamp_utc: "2026-01-02T03:04:00.000Z"
    }, { formatDate: fixedDate });

    assertEqual(model.id, "entry-1");
    assertEqual(model.medium, "TV");
    assertEqual(model.title, "Black Sails");
    assertEqual(model.reaction, "Loved");
    assertEqual(model.cognitiveState, "High capacity");
    assertEqual(model.tags.length, 2);
    assertEqual(model.created, "2026-01-02 03:04");
  });

  test("renderDetailHtml includes detail content and actions", ["REQ-LIBRARY-004"], () => {
    const html = Detail.renderDetailHtml({
      medium: "Book",
      title: "Project Hail Mary",
      reaction: "Liked",
      cognitive_state: "Medium capacity",
      tags: ["science"],
      note: "Good recovery arc.",
      timestamp_utc: "2026-01-02T03:04:00.000Z"
    }, { formatDate: fixedDate });

    assert(html.includes("Project Hail Mary"), "detail should include title");
    assert(html.includes("Book"), "detail should include medium");
    assert(html.includes("Liked"), "detail should include reaction");
    assert(html.includes("science"), "detail should include tags");
    assert(html.includes("Good recovery arc."), "detail should include note");
    assert(html.includes('id="edit-entry"'), "detail should include edit action");
    assert(html.includes('id="delete-entry"'), "detail should include delete action");
    assert(html.includes('data-nav="library"'), "detail should include back action");
  });

  test("renderDetailHtml escapes unsafe detail content", ["REQ-LIBRARY-004"], () => {
    const html = Detail.renderDetailHtml({
      medium: "TV",
      title: "<script>alert(1)</script>",
      reaction: "Loved",
      tags: ["<tag>"],
      note: "Use & escape",
      timestamp_utc: "2026-01-02T03:04:00.000Z"
    }, { formatDate: fixedDate });

    assert(html.includes("&lt;script&gt;alert(1)&lt;/script&gt;"), "title should be escaped");
    assert(html.includes("&lt;tag&gt;"), "tag should be escaped");
    assert(html.includes("Use &amp; escape"), "note should be escaped");
  });
})();
