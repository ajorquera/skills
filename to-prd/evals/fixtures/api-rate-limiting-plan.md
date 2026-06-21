# Public API Rate Limiting — Plan

*Drafted 2026-06-15*

## Goal

Add rate limiting to our public REST API so a single client can't degrade service for everyone. A
customer's runaway script took the API down for 20 minutes last week; this is now urgent.

## What we're working with

- The API runs behind an existing API gateway (Kong). Every request already carries an API key we
  can identify the client by.
- We have Redis available in the same cluster, already used for caching.
- Diego owns the API platform and will implement; he wants the work broken into issues he can pick up
  one at a time.
- Limits should be per API key, not per IP — customers behind shared NAT shouldn't collide.
- We are not building per-endpoint custom limits in this first pass; one global limit per key is fine
  to start.

## The plan

1. Implement a fixed-window rate limiter keyed by API key, backed by Redis, enforced at the Kong layer.
2. Set the default limit (a starting number — see open questions) and make it configurable without a
   redeploy.
3. Return `429 Too Many Requests` with a `Retry-After` header and a clear JSON error body when a
   client exceeds the limit.
4. Add response headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`) so clients
   can self-throttle.
5. Emit metrics so we can see who's hitting limits and tune the numbers.

## Open questions

- What's the actual default limit — requests per minute? We haven't picked a number; needs a look at
  current p99 client traffic before committing.
- Do we give paying enterprise tiers a higher limit at launch, or treat everyone equally for v1?

## Definition of done

- A client exceeding the limit gets a 429 with Retry-After; well-behaved clients are unaffected.
- Limits are enforced per API key and adjustable without a deploy.
- Rate-limit headers are present on responses and metrics show limit hits per key.
