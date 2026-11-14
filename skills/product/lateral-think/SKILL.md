---
name: lateral-think
description: Use for open-ended analysis, ideation, strategy, learning, research planning, and "outside the box" problem solving. Do not use for obvious mechanical tasks where the direct answer is clearly best.
argument-hint: "[problem, decision, strategy, idea search, learning goal, or ambiguous question]"
---

# Lateral Think

Use this workflow when the user needs a different way to think, not just a
different-looking answer.

Problem:

```text
$ARGUMENTS
```

1. Sanity-check the obvious answer first. If it is clearly best, say so and do
   not force novelty.
2. Reframe the problem in 3-5 materially different ways. Include hidden
   assumptions and a better objective if the user's framing is weak.
3. Generate options in three bands:
   - Near: practical extensions of the current path.
   - Adjacent: different mechanisms or domains that still fit the constraints.
   - Weird: counterintuitive options that could be valuable after a cheap probe.
4. For each serious option, name the durable asset, required infrastructure,
   why it could matter, why it might fail, and the cheapest 24-48h validation.
5. If the user asked to search or investigate, use available tools. If live
   research is not available, state that clearly and avoid pretending it was
   verified.
6. Converge pragmatically: choose the best path only after comparing utility,
   cost, reversibility, evidence, and risk.
7. End with the smallest next probe. Do not recommend a large build or
   fine-tune unless it beats simpler alternatives.

Rules:
- Do not be weird for its own sake.
- Do not bury the obvious answer if it wins.
- Do not default to fine-tuning when a dataset, eval, workflow, or product
  artifact would create more durable value.
- Avoid generic lists. Make options concrete enough to test.
