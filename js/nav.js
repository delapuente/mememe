
function openEditor(blob) {
  goTo('edit-view');
  loadInEditor(blob);
}

function goTo(id) {
  var targetRegion, regions = document.querySelectorAll('[role="region"]');
  for (var i = 0, l = regions.length; i < l; i++) {
    regions[i].classList.remove('active');
    regions[i].hidden = true;
  }
  targetRegion = document.getElementById(id);
  targetRegion.hidden = false;
  targetRegion.classList.add('active');
}

function initialize() {
  navigator.mozSetMessageHandler('activity', function(request) {
    var option = request.source;
    if (option.name === "share") {
      var blob = option.data.blob || option.data.blobs[0];
      openEditor(blob);
    }
  });



  document.querySelector('#edit-view .close').onclick = function (evt) {
    goTo('index-view');
  };

  document.querySelector('#edit-view .done').onclick = function (evt) {
    goTo('index-view');
    var canvas = document.getElementById('composition-canvas');
    canvas.toBlob(function (blob) {
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
          var newPoster = templates['poster'].render(info);
          posterList.insertBefore(newPoster, reference);
          canvas.width = canvas.height = 0;
          asyncStorage.setItem(fileName, {
            title: info.title,
            subtitle: info.subtitle,
            thumb: resized
          });
        });

      };
      request.onerror = function () {
        canvas.width = canvas.height = 0;
        console.error('Can not save the poster!');
      };
    }, 'image/jpeg', 0.7);
  };

  var posters = [];
  var cursor = picturesStorage.enumerate(PATH);
  cursor.onsuccess = function () {
    var file = cursor.result;
    if (file) {
      var filePath = file.name;
      var fileName = getName(filePath);
      asyncStorage.getItem(fileName, function (info) {
        if (!info) {
          resizeImage(file, THUMB_SIZE, function (resized) {
            posters.push({
              path: filePath,
              title: fileName,
              subtitle: '',
              thumb: URL.createObjectURL(resized)
            });
            cursor.continue();
          });
        }
        else {
          posters.push({
            path: filePath,
            title: info.title,
            subtitle: info.subtitle,
            thumb: URL.createObjectURL(info.thumb)
          });
          cursor.continue();
        }
      });
    }
    else {
      var fragment = templates['poster'].render(posters);
      document.getElementById('poster-list').appendChild(fragment);
    }
  };

  posterList = document.getElementById('poster-list');
  posterList.addEventListener('click', function (evt) {
    console.log(evt.target.tagName);
    if (evt.target.tagName === 'IMG') {
      var filePath = evt.target.dataset.path;
      var request = picturesStorage.get(filePath);
      request.onsuccess = function () {
        new MozActivity({
          name: 'open',
          data: { filename: filePath, type: 'image/jpeg', blob: request.result }
        });
      };
    }
    else {
      new MozActivity({
        name: 'share'
      });
    }
  }, true);

  titleInput = document.getElementById('title-input');
  explanationInput = document.getElementById('explanation-input');
  titleInput.value = DEFAULT_TITLE;
  explanationInput.value = DEFAULT_EXPLANATION;
  titleInput.addEventListener('input', onInputUpdateLabels);
  explanationInput.addEventListener('input', onInputUpdateLabels);
}



function onInputUpdateLabels() {
  updateLabels(titleInput.value, explanationInput.value);
}

function loadInEditor(blob) {
  var objectURL = URL.createObjectURL(blob);
  var overlay = document.getElementById('overlay');
  var canvas = document.getElementById('composition-canvas');
  var ctx = canvas.getContext('2d');
  var img = new Image();
  img.src = objectURL;
  img.onload = function () {
    var width = overlay.width;
    var height = overlay.height;
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    ctx.drawImage(overlay, 0, 0);
    onInputUpdateLabels();
  };
}

var TEXTAREA_OFFSET = 0.77;
var TITLE_FONT_SCALE = 0.12;
var EXPLANATION_FONT_SCALE = 0.06;
var TITLE_HANGING_OFFSET = 0.775;
var EXPLANATION_BOTTOM_OFFSET = 0.98;

function updateLabels(title, explanation) {
  var canvas = document.getElementById('composition-canvas');
  var ctx = canvas.getContext('2d');

  // Clear the area
  ctx.fillStyle = 'black';
  ctx.fillRect(
    0, TEXTAREA_OFFSET * canvas.height,
    canvas.width, (1 - TEXTAREA_OFFSET) * canvas.height
  );

  // Write main title
  ctx.fillStyle = 'white';
  ctx.font = (TITLE_FONT_SCALE * canvas.height) + 'px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'hanging';
  ctx.fillText(
    title.toUpperCase(),
    canvas.width / 2, TITLE_HANGING_OFFSET * canvas.height
  );

  // Write explanation
  ctx.font = (EXPLANATION_FONT_SCALE * canvas.height) + 'px serif';
  ctx.textBaseline = 'bottom';
  ctx.fillText(
    explanation,
    canvas.width / 2, EXPLANATION_BOTTOM_OFFSET * canvas.height
  );
};
