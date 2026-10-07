---
name: core-testing-strategies
description: Reproduction-first bug fixing, test tier selection and surgical mocking. Use when fixing a bug, writing or changing tests, or choosing between unit, integration and E2E tests.
---

# Testing Strategies

## I. Testing Commandments

- **Reproduction-First:** Never apply a bugfix or patch without first writing an automated test case that successfully reproduces the reported failure.
- **Right Lane Principle:** Assign test cases to the correct testing tier. Do not write slow end-to-end (E2E) or integration tests if the behavior can be exhaustively validated by a fast unit test. Keep E2E tests focused strictly on critical user journeys.
- **Surgical Mocking:** Mock only external third-party APIs or network-level resources. Avoid mocking internal business structures or models, which conceals critical typing regressions.
- **Isolation:** Ensure test suites have zero cross-test state dependencies. Always teardown mock states and reset databases between test executions.

## II. Clean Test Code

- **A-A-A Pattern:** Maintain explicit, visible structure inside tests: Arrange (set up), Act (execute), Assert (verify).
- **No Over-Abstraction:** Keep test setups simple and readable. Do not build deeply nested, reusable test helpers that obscure the behavior being tested.
