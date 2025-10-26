const UAParser = require('ua-parser-js');

function classifyDeviceType(uaString) {
  const ua = uaString || '';
  const parser = new UAParser(ua);
  const device = parser.getDevice();
  const os = parser.getOS();
  const browser = parser.getBrowser();

  // Bots detection (basic)
  if (/bot|crawl|spider|slurp|bingpreview/i.test(ua)) {
    return 'bot';
  }

  const type = (device && device.type) || null; // mobile, tablet, console, smarttv, wearable, embedded
  if (type === 'mobile') return 'mobile';
  if (type === 'tablet') return 'tablet';
  if (type === 'smarttv') return 'smarttv';
  if (type === 'console') return 'console';
  if (type === 'wearable') return 'wearable';

  // Fallback heuristics
  const osName = (os && os.name) || '';
  if (/windows|mac os|linux|chrome os/i.test(osName)) {
    return 'desktop';
  }
  // If no clear OS and no device type, assume mobile for common hints
  if (/iphone|android|mobile/i.test(ua)) return 'mobile';

  return 'other';
}

module.exports = { classifyDeviceType };