# Copilot instructions

## Playwright validation before pushing

Before pushing any commit to a pull-request branch, run every Playwright suite
applicable to the change. Use the repository test scripts, Playwright projects,
and [TESTING.md](../TESTING.md) as the source of truth. Do not push until the
applicable tests have completed and their results are known.

If required cloud services, credentials, indexes, or other resources are
unavailable, don't fabricate success or skip all testing. Run every
non-cloud, mocked, or local Playwright suite that can run. In the final
user-facing response:

* List the test commands and results.
* Explicitly identify every cloud-dependent suite that didn't run and the
  precise reason.
* Report unexpected failures and XPASS results (`expected to fail, but passed`)
  as non-green results. Don't describe the overall suite as passing when either
  occurs.
