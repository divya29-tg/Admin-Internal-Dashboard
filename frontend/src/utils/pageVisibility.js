export const getPageVisibility = () => {
  if (typeof document === 'undefined') return true;
  return document.visibilityState === 'visible';
};

export const onVisibilityChange = (callback) => {
  if (typeof document === 'undefined' || typeof document.addEventListener !== 'function') {
    return () => {};
  }

  document.addEventListener('visibilitychange', callback);
  return () => {
    document.removeEventListener('visibilitychange', callback);
  };
};
