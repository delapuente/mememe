this.resizeImage = (function() {
  'use strict';

  function resizeImage(blob, fit, callback) {
    var src = URL.createObjectURL(blob);
    var img = new Image();
    img.onload = function () {
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      var maxlength = fit;
      if (Array.isArray(maxlength)) {
        maxlength = img.height > img.width ? fit[1] : fit[0];
      }
      var scale = maxlength / Math.max(img.width, img.height);
      canvas.width = scale * img.width;
      canvas.height = scale * img.height;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(callback, 'image/jpeg', 0.7);
    }
    img.src = src;
  }

  return resizeImage;
}());
