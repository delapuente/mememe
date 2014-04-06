
function initializeIndex() {
  newPosterButton.onclick = function (evt) {
    evt.preventDefault();
    pickImage(openEditor);
  };

  posterList.addEventListener('click', function (evt) {
    var element = evt.target;
    var filePath = getPathFromItem(element);
    var fileName = getName(filePath);

    /* Use .get() method of device storage to get the contents of a file. */
    var request = /* Use .get() here */;
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
  /* Use the activity open to request open the picture. */
}

function sharePicture(fileName, picture) {
  /* Use the activity share to request share the picture. */
}

function pickImage(callback) {
  /* Use the activity pick to request take an image. */
  var activity = new MozActivity(/* ... */);

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
  /* Use .enumerate() to list the contents of a directory via cursor. */
  var cursor = /* Use .enumerate() here. */;
  cursor.onsuccess = function () {
    var file = cursor.result; // here is the next file

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
          cursor.continue(); // use continue when you want to get the next file
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
