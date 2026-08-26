/**
 * Redis Lua script for atomic 2-user matchmaking.
 *
 * Pairs the current user with the oldest other member of the general queue,
 * then removes both from general and all tracked interest queues.
 * Returns [currentUser, partner] or nil.
 */
export const ATOMIC_MATCH_SCRIPT = `
local generalQueue = KEYS[1]
local currentUserId = ARGV[1]
local interestPrefix = ARGV[2]
local sessionPrefix = ARGV[3]

local score = redis.call('ZSCORE', generalQueue, currentUserId)
if not score then
    return nil
end

local excluded = {}
for i = 4, #ARGV do
    excluded[ARGV[i]] = true
end

local members = redis.call('ZRANGE', generalQueue, 0, 99)
local partnerId = nil

for i, member in ipairs(members) do
    if member ~= currentUserId and not excluded[member] then
        partnerId = member
        break
    end
end

if partnerId == nil then
    return nil
end

local function clearUser(id)
    local setKey = sessionPrefix .. id
    local slugs = redis.call('SMEMBERS', setKey)
    for _, slug in ipairs(slugs) do
        redis.call('ZREM', interestPrefix .. slug, id)
    end
    redis.call('ZREM', generalQueue, id)
    redis.call('DEL', setKey)
end

clearUser(currentUserId)
clearUser(partnerId)
return {currentUserId, partnerId}
`;

/**
 * Redis Lua script for interest matching.
 * Finds another user in the given interest queue (excluding self and skipped ids),
 * then removes both from every tracked queue.
 */
export const ATOMIC_INTEREST_MATCH_SCRIPT = `
local interestQueue = KEYS[1]
local generalQueue = KEYS[2]
local currentUserId = ARGV[1]
local interestPrefix = ARGV[2]
local sessionPrefix = ARGV[3]

local excluded = {}
for i = 4, #ARGV do
    excluded[ARGV[i]] = true
end

local members = redis.call('ZRANGE', interestQueue, 0, 99)
local partnerId = nil

for i, member in ipairs(members) do
    if member ~= currentUserId and not excluded[member] then
        partnerId = member
        break
    end
end

if partnerId == nil then
    return nil
end

local function clearUser(id)
    local setKey = sessionPrefix .. id
    local slugs = redis.call('SMEMBERS', setKey)
    for _, slug in ipairs(slugs) do
        redis.call('ZREM', interestPrefix .. slug, id)
    end
    redis.call('ZREM', interestQueue, id)
    redis.call('ZREM', generalQueue, id)
    redis.call('DEL', setKey)
end

clearUser(currentUserId)
clearUser(partnerId)
return {currentUserId, partnerId}
`;

/**
 * Acquire every lock key for this session, or none.
 * Re-entrant: if all existing keys already belong to this sessionId, refresh TTL.
 * ARGV[1] = sessionId, ARGV[2] = ttl seconds.
 */
export const DEVICE_SESSION_ACQUIRE_SCRIPT = `
local sessionId = ARGV[1]
local ttl = tonumber(ARGV[2])

for i, key in ipairs(KEYS) do
    local current = redis.call('GET', key)
    if current and current ~= sessionId then
        return 0
    end
end

for i, key in ipairs(KEYS) do
    redis.call('SET', key, sessionId, 'EX', ttl)
end
return 1
`;

/**
 * Refresh TTL on keys still owned by this session.
 * ARGV[1] = sessionId, ARGV[2] = ttl seconds.
 */
export const DEVICE_SESSION_REFRESH_SCRIPT = `
local sessionId = ARGV[1]
local ttl = tonumber(ARGV[2])

for i, key in ipairs(KEYS) do
    if redis.call('GET', key) == sessionId then
        redis.call('EXPIRE', key, ttl)
    end
end
return 1
`;

/**
 * Delete keys only if they still belong to this session (idempotent).
 * ARGV[1] = sessionId.
 */
export const DEVICE_SESSION_RELEASE_SCRIPT = `
local sessionId = ARGV[1]

for i, key in ipairs(KEYS) do
    if redis.call('GET', key) == sessionId then
        redis.call('DEL', key)
    end
end
return 1
`;
