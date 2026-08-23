/**
 * Redis Lua script for atomic 2-user matchmaking.
 * 
 * Pops 2 users from the general queue atomically.
 * Returns [user1, user2] or nil.
 */
export const ATOMIC_MATCH_SCRIPT = `
local queue = KEYS[1]
local count = redis.call('ZCARD', queue)

if count >= 2 then
    local matched = redis.call('ZRANGE', queue, 0, 1)
    redis.call('ZREM', queue, matched[1], matched[2])
    return matched
else
    return nil
end
`;

/**
 * Redis Lua script for interest matching.
 * Checks if another user is in the given interest queue.
 * If found, removes both from the interest queue and all other queues.
 */
export const ATOMIC_INTEREST_MATCH_SCRIPT = `
local interestQueue = KEYS[1]
local generalQueue = KEYS[2]
local currentUserId = ARGV[1]

-- Find partner in interest queue (excluding self)
local members = redis.call('ZRANGE', interestQueue, 0, 10)
local partnerId = nil

for i, member in ipairs(members) do
    if member ~= currentUserId then
        partnerId = member
        break
    end
end

if partnerId ~= nil then
    redis.call('ZREM', interestQueue, currentUserId, partnerId)
    redis.call('ZREM', generalQueue, currentUserId, partnerId)
    return {currentUserId, partnerId}
else
    return nil
end
`;
