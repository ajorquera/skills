# Customer Referral Program — Plan

*Drafted 2026-06-02*

## Goal

Launch a referral program so existing customers can invite friends and both sides get a reward. The
aim is to lower paid-acquisition spend by making word-of-mouth a real, trackable channel. Marketing
believes referrals could become a meaningful share of new signups within two quarters.

## What we're working with

- We have an existing accounts system with verified email per user, and a billing system (Stripe)
  that already supports account credits.
- Legal has signed off on a "give $20, get $20 in account credit" structure for the US. International
  rewards are not approved yet.
- Priya (PM) owns the program; Marcus leads engineering; design support is available from the
  growth pod.
- Target: a working program live to all US customers. International is explicitly out of scope for
  this launch.
- We are not building a public affiliate/influencer program — this is customer-to-customer only.

## The plan

### Phase 1 — Referral mechanics (foundation)

1. Generate a unique, shareable referral link per customer, tied to their account.
2. Build the attribution: when a new user signs up via a referral link, record who referred them and
   mark the referral "pending."
3. Define the qualifying event that converts a referral from "pending" to "qualified" — the referred
   user completing their first paid month.

### Phase 2 — Rewards

4. On qualification, issue $20 in Stripe account credit to both the referrer and the referred user.
5. Cap rewards at $200 in credit per referrer per year to limit abuse.
6. Handle edge cases: self-referral, referred user refunding/churning before qualification.

### Phase 3 — Surfaces & visibility

7. Build a "Refer a friend" page where customers get their link and see their referral status.
8. Add an email that nudges happy customers (those past 60 days, no support escalations) to refer.
9. Give Priya a simple dashboard: referrals sent, qualified, and credit issued.

## Open questions

- What's the fraud threshold before we manually review an account? Marcus wants a rule; we haven't
  set the number.
- Do we show the referrer the *identity* of who they referred, or just an anonymized status? Privacy
  hasn't weighed in.

## Definition of done

- Any US customer can get their referral link and share it.
- A referred signup is correctly attributed and, on first paid month, both parties receive $20
  credit, subject to the annual cap.
- Self-referrals and pre-qualification churn don't pay out.
- Priya can see referrals sent, qualified, and total credit issued on a dashboard.
