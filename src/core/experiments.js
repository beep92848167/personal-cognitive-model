(function (global) {
  function defineExperiment(config = {}) {
    return {
      id: config.id || "default",
      name: config.name || config.id || "Default experiment",
      description: config.description || "",
      variants: (config.variants || []).map((variant, index) => ({
        id: variant.id || `variant-${index + 1}`,
        name: variant.name || variant.id || `Variant ${index + 1}`,
        strategy: variant.strategy || "baseline",
        weight: Number(variant.weight || 1)
      }))
    };
  }

  function chooseVariant(experiment = {}, key = "") {
    const variants = experiment.variants || [];
    if (!variants.length) return null;
    const text = String(key || experiment.id || "");
    let hash = 0;
    for (let i = 0; i < text.length; i += 1) {
      hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
    }
    const index = Math.abs(hash) % variants.length;
    return variants[index];
  }

  function applyVariant(recommendations = [], variant = null) {
    if (!variant) return recommendations || [];

    const mapped = (recommendations || []).map((rec, index) => {
      let score = rec.score || 0;

      if (variant.strategy === "confidence-weighted") {
        const confidence = rec.explanation?.confidence || rec.reasoning?.confidence || "";
        score += confidence === "High" ? 5 : confidence === "Low" ? -5 : 0;
      }

      if (variant.strategy === "source-rich") {
        const sourceCount = (rec.explanation?.sources || rec.sources || []).length;
        score += Math.min(10, sourceCount * 2);
      }

      if (variant.strategy === "learning-forward") {
        score += rec.learningAdjustment || 0;
      }

      return {
        ...rec,
        experiment: {
          id: variant.experimentId || "",
          variantId: variant.id,
          variantName: variant.name,
          strategy: variant.strategy
        },
        originalExperimentScore: rec.score || 0,
        score: Math.max(0, Math.min(100, Math.round(score))),
        experimentRank: index + 1
      };
    });

    return mapped.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  }

  function runExperiment(experiment = {}, recommendations = [], key = "") {
    const selected = chooseVariant(experiment, key);
    const variant = selected ? { ...selected, experimentId: experiment.id } : null;
    return {
      experiment,
      variant,
      recommendations: applyVariant(recommendations, variant)
    };
  }

  function summarizeExperimentResult(result = {}, feedbackItems = []) {
    const variantId = result.variant?.id || "";
    const recTitles = new Set((result.recommendations || []).map(rec => rec.title));
    const relevantFeedback = (feedbackItems || []).filter(item => recTitles.has(item.title));
    const positive = relevantFeedback.filter(item => Number(item.value || 0) > 0).length;
    const negative = relevantFeedback.filter(item => Number(item.value || 0) < 0).length;

    return {
      experimentId: result.experiment?.id || "",
      variantId,
      recommendationCount: (result.recommendations || []).length,
      feedbackCount: relevantFeedback.length,
      positive,
      negative,
      netFeedback: positive - negative
    };
  }

  global.OpenPCMExperiments = {
    defineExperiment,
    chooseVariant,
    applyVariant,
    runExperiment,
    summarizeExperimentResult
  };
})(window);
