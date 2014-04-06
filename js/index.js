
function initializeIndex() {
  newMemeButton.onclick = function (evt) {
    evt.preventDefault();
    pickImage(openEditor);
  };

  posterList.addEventListener('click', function (evt) {
    var element = evt.target;
    var filePath = getPathFromItem(element);
    var fileName = getName(filePath);
    var request = picturesStorage.get(filePath);
    request.onsuccess = function () {
      var picture = request.result;
      if (element.tagName === 'IMG') { viewPicture(fileName, picture); }
      else { sharePicture(fileName, picture); }
    };
  }, true);

  loadPosterList();
}

function getPathFromItem(element) {
  while (element.tagName !== 'LI' && element.parentNode !== null) {
    element = element.parentNode;
  }
  return element.dataset.path;
}

function viewPicture(fileName, picture) {
  new MozActivity({
    name: 'open',
    data: { filename: fileName, type: picture.type, blob: picture }
  });
}

function sharePicture(fileName, picture) {
  new MozActivity({
    name: 'share',
    data: {
      type: 'image/*',
      number: 1,
      blobs: [picture],
      filenames: [fileName]
    }
  });
}

function pickImage(callback) {
  var activity = new MozActivity({
    name: 'pick',
    data: {
      type: 'image/*'
    }
  });

  activity.onsuccess = function () {
    var picture = this.result;
    callback && callback(picture.blob);
  };

  activity.onerror = function () {
    console.error(this.error);
  }
}

function loadPosterList() {
  var posters = [];
  var cursor = picturesStorage.enumerate(PATH);
  cursor.onsuccess = function () {
    var file = cursor.result;

    var filePath = file.name;
    var fileName = getName(filePath);
    asyncStorage.getItem(fileName, function (info) {
      if (!info) {
        resizeImage(file, THUMB_SIZE, function (resized) {
          var fragment = TEMPLATES['poster'].render({
            path: filePath,
            title: fileName,
            subtitle: '',
            thumb: URL.createObjectURL(resized)
          });
          posterList.insertBefore(fragment, posterList.children[0]);
          cursor.continue();
        });
      }
      else {
        var fragment = TEMPLATES['poster'].render({
          path: filePath,
          title: info.title,
          subtitle: info.subtitle,
          thumb: URL.createObjectURL(info.thumb)
        });
        posterList.insertBefore(fragment, posterList.children[0]);
        cursor.continue();
      }
    });
  };
}

function getName(filePath) {
  var pathFragments = filePath.split('/');
  return pathFragments[pathFragments.length - 1];
}
