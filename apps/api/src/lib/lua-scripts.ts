/**
 * Redis Lua script for atomic 2-user matchmaking.
 *
 * Pairs the current user with the oldest other live member of the general queue,
 * then removes both from general and all tracked interest queues.
 * Stale / offline members are purged instead of matched.
 * Returns [currentUser, partner] or nil.
 *
 * KEYS[1] general queue
 * KEYS[2] online sessions ZSET
 * ARGV[1] current user id
 * ARGV[2] interest queue prefix
 * ARGV[3] session-interests prefix
 * ARGV[4] online cutoff timestamp (ms)
 * ARGV[5+] excluded session ids
 */
export const ATOMIC_MATCH_SCRIPT = `
local generalQueue = KEYS[1]
local onlineSet = KEYS[2]
local currentUserId = ARGV[1]
local interestPrefix = ARGV[2]
local sessionPrefix = ARGV[3]
local cutoff = tonumber(ARGV[4])

local excluded = {}
for i = 5, #ARGV do
    excluded[ARGV[i]] = true
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

-- If the online key was evicted, do not treat everyone as a ghost.
local enforceOnline = redis.call('EXISTS', onlineSet) == 1

local function isLive(id)
    if enforceOnline == false then
        return true
    end
    local seen = redis.call('ZSCORE', onlineSet, id)
    if not seen then
        return false
    end
    return tonumber(seen) >= cutoff
end

local score = redis.call('ZSCORE', generalQueue, currentUserId)
if not score then
    return nil
end

local members = redis.call('ZRANGE', generalQueue, 0, 99)
local partnerId = nil

for i, member in ipairs(members) do
    if member ~= currentUserId and not excluded[member] then
        if isLive(member) then
            partnerId = member
            break
        else
            clearUser(member)
        end
    end
end

if partnerId == nil then
    return nil
end

clearUser(currentUserId)
clearUser(partnerId)
return {currentUserId, partnerId}
`;

/**
 * Redis Lua script for interest matching.
 * Finds another live user in the given interest queue (excluding self and skipped ids),
 * then removes both from every tracked queue. Stale members are purged.
 *
 * KEYS[1] interest queue
 * KEYS[2] general queue
 * KEYS[3] online sessions ZSET
 * ARGV[1] current user id
 * ARGV[2] interest queue prefix
 * ARGV[3] session-interests prefix
 * ARGV[4] online cutoff timestamp (ms)
 * ARGV[5+] excluded session ids
 */
export const ATOMIC_INTEREST_MATCH_SCRIPT = `
local interestQueue = KEYS[1]
local generalQueue = KEYS[2]
local onlineSet = KEYS[3]
local currentUserId = ARGV[1]
local interestPrefix = ARGV[2]
local sessionPrefix = ARGV[3]
local cutoff = tonumber(ARGV[4])

local excluded = {}
for i = 5, #ARGV do
    excluded[ARGV[i]] = true
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

local enforceOnline = redis.call('EXISTS', onlineSet) == 1

local function isLive(id)
    if enforceOnline == false then
        return true
    end
    local seen = redis.call('ZSCORE', onlineSet, id)
    if not seen then
        return false
    end
    return tonumber(seen) >= cutoff
end

local members = redis.call('ZRANGE', interestQueue, 0, 99)
local partnerId = nil

for i, member in ipairs(members) do
    if member ~= currentUserId and not excluded[member] then
        if isLive(member) then
            partnerId = member
            break
        else
            clearUser(member)
        end
    end
end

if partnerId == nil then
    return nil
end

clearUser(currentUserId)
clearUser(partnerId)
return {currentUserId, partnerId}
`;
