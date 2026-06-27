(function () {
  const { test, assertEqual, assertDeepEqual } = window.OpenPCMTest;
  const Validation = window.OpenPCMValidation;

  test("validateTitle rejects empty titles", ["REQ-EVIDENCE-001"], () => {
    const result = Validation.validateTitle("   ");
    assertEqual(result.valid, false);
    assertEqual(result.errors[0], "Please enter a title.");
  });

  test("validateTitle trims whitespace", ["REQ-EVIDENCE-001"], () => {
    const result = Validation.validateTitle("  Black Sails  ");
    assertEqual(result.valid, true);
    assertEqual(result.value, "Black Sails");
  });

  test("duplicateTitleWarning reports duplicate evidence", ["REQ-EVIDENCE-004"], () => {
    const warning = Validation.duplicateTitleWarning([{ id: "1", title: "Black Sails" }], "black sails", "");
    assertEqual(warning, "Existing entry found: Black Sails. You may want to edit it instead.");
  });

  test("duplicateTitleWarning ignores current editing item", ["REQ-EVIDENCE-004", "REQ-EVIDENCE-005"], () => {
    const warning = Validation.duplicateTitleWarning([{ id: "1", title: "Black Sails" }], "Black Sails", "1");
    assertEqual(warning, "");
  });

  test("validateTags accepts text tags and trims them", ["REQ-EVIDENCE-001"], () => {
    const result = Validation.validateTags([" systems ", "competence"]);
    assertEqual(result.valid, true);
    assertDeepEqual(result.value, ["systems", "competence"]);
  });

  test("validateTags rejects non-array tags", ["REQ-EVIDENCE-001"], () => {
    const result = Validation.validateTags("systems");
    assertEqual(result.valid, false);
  });

  test("validateEntry returns normalized value and duplicate warning", ["REQ-EVIDENCE-001", "REQ-EVIDENCE-004"], () => {
    const result = Validation.validateEntry(
      { id: "2", title: "  Black Sails  ", tags: [" institutions "] },
      [{ id: "1", title: "Black Sails" }]
    );
    assertEqual(result.valid, true);
    assertEqual(result.value.title, "Black Sails");
    assertDeepEqual(result.value.tags, ["institutions"]);
    assertEqual(result.warnings.length, 1);
  });
})();
