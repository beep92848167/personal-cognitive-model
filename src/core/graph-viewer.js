(function (global) {
  function escapeHtml(s) {
    return String(s ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  }

  function buildViewerModel(graph = {}, selectedNodeId = null) {
    const nodes = graph.nodes || [];
    const edges = graph.edges || [];
    const selected = selectedNodeId ? nodes.find(node => node.id === selectedNodeId) || null : null;
    const connectedEdgeIds = selected
      ? edges.filter(edge => edge.from === selected.id || edge.to === selected.id).map(edge => `${edge.from}->${edge.to}:${edge.type}`)
      : [];
    return { root: graph.root || "", nodes, edges, selected, connectedEdgeIds };
  }

  function renderGraphHtml(graph = {}, selectedNodeId = null) {
    const model = buildViewerModel(graph, selectedNodeId);
    return `
      <div class="graph-viewer">
        <h3>Explanation graph</h3>
        <div class="graph-node-list">
          ${model.nodes.map(node => `
            <button class="graph-node ${node.id === model.selected?.id ? "selected" : ""}" data-graph-node="${escapeHtml(node.id)}">
              <strong>${escapeHtml(node.label || node.id)}</strong>
              <span>${escapeHtml(node.type)}</span>
            </button>
          `).join("")}
        </div>
        <div class="graph-edge-list">
          <h4>Links</h4>
          ${model.edges.length ? model.edges.map(edge => {
            const id = `${edge.from}->${edge.to}:${edge.type}`;
            return `<div class="graph-edge ${model.connectedEdgeIds.includes(id) ? "selected" : ""}">
              <code>${escapeHtml(edge.from)}</code> → <code>${escapeHtml(edge.to)}</code>
              <span>${escapeHtml(edge.type)}</span>
            </div>`;
          }).join("") : `<p class="meta">No graph links.</p>`}
        </div>
        ${model.selected ? `
          <div class="note">
            <strong>${escapeHtml(model.selected.label || model.selected.id)}</strong>
            <p class="meta">${escapeHtml(model.selected.type)}</p>
            <pre>${escapeHtml(JSON.stringify(model.selected.data || {}, null, 2))}</pre>
          </div>
        ` : `<p class="meta">Tap a node to inspect it.</p>`}
      </div>`;
  }

  global.OpenPCMGraphViewer = { buildViewerModel, renderGraphHtml };
})(window);
