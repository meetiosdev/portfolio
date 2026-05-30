(function () {
  function shareResume() {
    const shareUrl = "https://meetiosdev.com/";
    const shareData = {
      title: 'Swarajmeet Singh — Senior iOS Engineer',
      text: "Check out Swarajmeet's portfolio and iOS Developer resume!",
      url: shareUrl
    };

    // Helper to copy to clipboard
    function copyToClipboard() {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl)
          .then(function () {
            window.alert('Portfolio link copied to clipboard!');
          })
          .catch(function (e) {
            console.error('Clipboard copy failed:', e);
            fallbackCopy();
          });
      } else {
        fallbackCopy();
      }
    }

    // Older fallback method
    function fallbackCopy() {
      const el = document.createElement('textarea');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand('copy');
        window.alert('Portfolio link copied to clipboard!');
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
      document.body.removeChild(el);
    }

    // Mobile check (supports navigator.share)
    if (navigator.share) {
      // 1. Copy to clipboard first
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl).catch(() => {});
      }
      // 2. Open native mobile share sheet
      navigator.share(shareData)
        .catch(function (err) {
          console.log('Share sheet action canceled:', err);
        });
    } else {
      // Desktop fallback: simply copy to clipboard
      copyToClipboard();
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const shareButton = document.querySelector('[data-share-resume]');
    if (shareButton) {
      shareButton.addEventListener('click', shareResume);
    }
  });
})();
