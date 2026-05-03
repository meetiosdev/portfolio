(function () {
  function shareResume() {
    const shareData = {
      title: 'Swarajmeet Singh - Lead iOS Developer',
      text: "Check out Swarajmeet's iOS Developer resume and portfolio!",
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData).catch(function () {});
      return;
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(function () {
        window.alert('Resume link copied to clipboard!');
      }).catch(function () {});
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const shareButton = document.querySelector('[data-share-resume]');
    if (shareButton) {
      shareButton.addEventListener('click', shareResume);
    }
  });
})();
