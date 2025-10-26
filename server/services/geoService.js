const fs = require('fs');
const path = require('path');
let maxmind;
let geoipLite;
try {
  maxmind = require('maxmind');
} catch (e) {
  // maxmind not installed or failed; will fallback
}
try {
  geoipLite = require('geoip-lite');
} catch (e) {
  // geoip-lite not installed
}

let cityLookup = null;
const DEFAULT_CITY_DB = path.join(__dirname, '../database/GeoLite2-City.mmdb');

async function initMaxMind() {
  if (!maxmind) return null;
  const customPath = process.env.MAXMIND_CITY_DB || process.env.MAXMIND_DB_CITY || '';
  const dbPath = customPath && fs.existsSync(customPath) ? customPath : (fs.existsSync(DEFAULT_CITY_DB) ? DEFAULT_CITY_DB : null);
  if (!dbPath) return null;
  try {
    cityLookup = await maxmind.open(dbPath);
    return cityLookup;
  } catch (e) {
    console.warn('MaxMind init failed:', e.message);
    cityLookup = null;
    return null;
  }
}

function getClientIp(req) {
  const xfwd = (req.headers['x-forwarded-for'] || '').toString();
  const remote = (req.socket?.remoteAddress || '').toString();
  let ip = xfwd.split(',')[0].trim() || remote || '';
  // Strip IPv6 prefix if present
  if (ip.startsWith('::ffff:')) ip = ip.substring(7);
  return ip;
}

function lookupGeo(ip) {
  if (!ip) return { country_code: null, region: null };
  try {
    if (cityLookup) {
      const res = cityLookup.get(ip);
      if (res) {
        const country_code = res.country?.iso_code || null;
        const region = (res.subdivisions && res.subdivisions[0]?.iso_code) || res.subdivisions?.[0]?.names?.en || null;
        return { country_code, region };
      }
    }
  } catch (e) {
    // fall through to geoip-lite
  }
  if (geoipLite) {
    try {
      const r = geoipLite.lookup(ip);
      if (r) {
        const country_code = r.country || null;
        const region = r.region || null;
        return { country_code, region };
      }
    } catch (e) {
      // ignore
    }
  }
  return { country_code: null, region: null };
}

module.exports = { initMaxMind, getClientIp, lookupGeo };