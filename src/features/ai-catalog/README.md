# AI Catalog Provider Detection

`detectLLMProvider()` uses API-key prefixes as a heuristic for choosing a likely model-list provider in the admin UI. A distinctive prefix such as `sk-ant-` or `sk-proj-` can be a useful hint, but it is not proof that the key is valid or owned by that provider.

Ambiguous signatures, including generic `sk-` and proxy-style keys, intentionally remain `unknown` until the explicit model import/check flow verifies them.
