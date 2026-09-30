-- Keep the payout actor-separation helper internal to trusted server-side callers.
-- The canonical payout RPC enforces the same separation-of-duties rule itself.
revoke execute on function app.guard_profit_payout_actor_separation(uuid) from authenticated;
