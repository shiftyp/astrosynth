export const vibrate = (duration: number | number[]) => {
  window.navigator.vibrate(duration);
};
