export const getPageVisibility = () => {
  if (typeof document === 'undefined') return true;
  return document.visibilityState === 'visible';
};

export const onVisibilityChange = (callback) => {
  if (typeof document === 'undefined' || typeof document.addEventListener !== 'function') {
    return () => {};
  }

  const handler = () => {
    if (typeof callback === 'function') {
      callback(document.visibilityState === 'visible');
    }
  };

  document.addEventListener('visibilitychange', handler);
  return () => {
    document.removeEventListener('visibilitychange', handler);
  };
};
