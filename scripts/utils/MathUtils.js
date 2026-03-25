// scripts/utils/MathUtils.js

class MathUtils {
  static clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  
  static lerp(start, end, amount) {
    return start + (end - start) * amount;
  }
  
  static randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }
  
  static degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  static isNumeric(v) {
    if (typeof(v) == "number") return true;
    return !isNaN(v) && !isNaN(parseFloat(v));
  }
  
  static radiansToDegrees(radians) {
    return radians * 180 / Math.PI;
  }

  static getOffset(length, angle) {
    return {
      x: length * Math.cos(angle),
      y: length * Math.sin(angle)
    };
  }
}