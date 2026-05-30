(function () {
  function shareResume() {
    const shareText = "Swarajmeet — Senior iOS Engineer\nWebsite: https://meetiosdev.com/\nResume: https://meetiosdev.com/resume/";
    const shareData = {
      title: 'Swarajmeet — Senior iOS Engineer',
      text: shareText
    };

    // Helper to copy to clipboard
    function copyToClipboard() {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText)
          .then(function () {
            window.alert('Contact details copied to clipboard!');
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
      el.value = shareText;
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand('copy');
        window.alert('Contact details copied to clipboard!');
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
      document.body.removeChild(el);
    }

    // Mobile check (supports navigator.share)
    if (navigator.share) {
      // 1. Copy to clipboard first
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).catch(() => {});
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
