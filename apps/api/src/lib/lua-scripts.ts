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
