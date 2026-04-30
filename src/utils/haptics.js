export const vibrate = (pattern = 50) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.warn("Vibration failed", e);
    }
  }
};

export const hapticFeedback = {
  light: () => vibrate(30),
  medium: () => vibrate(50),
  heavy: () => vibrate(100),
  success: () => vibrate([30, 50, 50]),
  error: () => vibrate([50, 50, 50, 50, 50]),
};
