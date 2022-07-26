const Redis = require("ioredis");
const { promisify } = require("util");

const redis = new Redis();

const getSnap = (key) => {
  const get = promisify(redis.mget).bind(redis);
  return get(key);
};

const getAllSnaps = (key) => {
  const keys = promisify(redis.keys).bind(redis);
  const snaps = keys(key);
  return snaps;
};

const setSnap = (key, values) => {
  const set = promisify(redis.set).bind(redis);
  return set(key, values);
};

module.exports = { redis, getSnap, setSnap, getAllSnaps };
