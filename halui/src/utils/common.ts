export const CheckIsMobile = () => {
  return /android|avantgo|blackberry|iphone|ipad|ipod|opera mini|palm|silk|windows phone|iemobile/i.test(navigator.userAgent);
};
