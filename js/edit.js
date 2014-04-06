
function initializeEdit() {

  navigator.mozSetMessageHandler('activity', function(request) {
    var option = request.source;
    if (option.name === "share") {
      var blob = option.data.blob || option.data.blobs[0];
      openEditor(blob);
    }
  });

  editCloseButton.onclick = function (evt) {
    goTo('index-view');
  };

  editDoneButton.onclick = function (evt) {
    goTo('index-view');
    savePoster();
  };

  titleInput.value = DEFAULT_TITLE;
  explanationInput.value = DEFAULT_EXPLANATION;
  titleInput.addEventListener('input', onInputUpdateLabels);
  explanationInput.addEventListener('input', onInputUpdateLabels);
}

function savePoster() {
  compositionCanvas.toBlob(function (blob) {
    var request =
      picturesStorage.addNamed(blob, PATH + '/' + Date.now() + '.jpg');
    request.onsuccess = function () {
      var filePath = this.result;
      var fileName = getName(filePath);
      var reference = posterList.children[0] || null;
      resizeImage(blob, THUMB_SIZE, function (resized) {
        var info = {
          path: filePath,
          title: titleInput.value,
          subtitle: explanationInput.value,
          thumb: URL.createObjectURL(resized)
        };
        var newPoster = TEMPLATES['poster'].render(info);
        posterList.insertBefore(newPoster, reference);
        compositionCanvas.width = compositionCanvas.height = 0;
        asyncStorage.setItem(fileName, {
          title: info.title,
          subtitle: info.subtitle,
          thumb: resized
        });
      });

    };
    request.onerror = function () {
      compositionCanvas.width = compositionCanvas.height = 0;
      console.error('Can not save the poster!');
    };
  }, 'image/jpeg', 0.7);
}


function onInputUpdateLabels() {
  updateLabels(titleInput.value, explanationInput.value);
}

function updateLabels(title, explanation) {
  var ctx = compositionCanvas.getContext('2d');

  // Clear the area
  ctx.fillStyle = 'black';
  ctx.fillRect(
    0, TEXTAREA_OFFSET * compositionCanvas.height,
    compositionCanvas.width, (1 - TEXTAREA_OFFSET) * compositionCanvas.height
  );

  // Write main title
  ctx.fillStyle = 'white';
  ctx.font = (TITLE_FONT_SCALE * compositionCanvas.height) + 'px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'hanging';
  ctx.fillText(
    title.toUpperCase(),
    compositionCanvas.width / 2,
    TITLE_HANGING_OFFSET * compositionCanvas.height
  );

  // Write explanation
  ctx.font = (EXPLANATION_FONT_SCALE * compositionCanvas.height) + 'px serif';
  ctx.textBaseline = 'bottom';
  ctx.fillText(
    explanation,
    compositionCanvas.width / 2,
    EXPLANATION_BOTTOM_OFFSET * compositionCanvas.height
  );
}

function loadInEditor(blob) {
  resizeImage(blob, [IMAGE_WIDTH, IMAGE_HEIGHT], function (resized) {
    var objectURL = URL.createObjectURL(resized);
    var overlay = document.getElementById('overlay');
    var ctx = compositionCanvas.getContext('2d');

    var img = new Image();
    img.src = objectURL;
    img.onload = function () {
      var width = overlay.width;
      var height = overlay.height;
      var imageOffsetX = (width - img.width) / 2;
      var imageOffsetY = (IMAGE_HEIGHT - img.height) / 2;
      compositionCanvas.width = width;
      compositionCanvas.height = height;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, compositionCanvas.width, compositionCanvas.height);
      ctx.drawImage(img, imageOffsetX, IMAGE_PADDING + imageOffsetY);
      ctx.drawImage(overlay, 0, 0);
      onInputUpdateLabels();
    };
  });
}
