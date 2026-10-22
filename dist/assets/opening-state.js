(() => {
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js');
  try {
    if (sessionStorage.getItem('eternaluxe-opening-v1') === 'complete') {
      document.documentElement.classList.add('opening-seen');
    }
  } catch {
    // The opening can still run when session storage is unavailable.
  }
})();
