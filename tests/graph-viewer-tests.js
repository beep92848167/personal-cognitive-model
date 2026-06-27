(function () {
  const { test, assert, assertEqual } = window.OpenPCMTest;
  const GraphViewer = window.OpenPCMGraphViewer;

  const graph = {
    root: "candidate:counterpart",
    nodes: [
      { id: "candidate:counterpart", type: "candidate", label: "Counterpart", data: { medium: "TV" } },
      { id: "score:counterpart", type: "score", label: "87%" },
      { id: "support:institutional", type: "supporting-signal", label: "Institutional Conflict" }
    ],
    edges: [
      { from: "support:institutional", to: "candidate:counterpart", type: "supports" },
      { from: "candidate:counterpart", to: "score:counterpart", type: "produces" }
    ]
  };

  test("buildViewerModel selects graph node and connected edges", ["REQ-GRAPHVIEWER-001"], () => {
    const model = GraphViewer.buildViewerModel(graph, "candidate:counterpart");
    assertEqual(model.selected.label, "Counterpart");
    assertEqual(model.connectedEdgeIds.length, 2);
  });

  test("renderGraphHtml renders nodes links and selected data", ["REQ-GRAPHVIEWER-001"], () => {
    const html = GraphViewer.renderGraphHtml(graph, "candidate:counterpart");
    assert(html.includes("Counterpart"), "html should include candidate");
    assert(html.includes("Institutional Conflict"), "html should include signal");
    assert(html.includes("supports"), "html should include edge type");
    assert(html.includes("&quot;medium&quot;: &quot;TV&quot;"), "html should include selected data");
  });

  test("renderGraphHtml escapes unsafe node labels", ["REQ-GRAPHVIEWER-001"], () => {
    const html = GraphViewer.renderGraphHtml({ nodes: [{ id: "x", type: "candidate", label: "<script>" }], edges: [] }, "x");
    assert(html.includes("&lt;script&gt;"), "unsafe label should be escaped");
  });
})();
