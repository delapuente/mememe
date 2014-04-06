
function initializeActivityHandler() {
  navigator.mozSetMessageHandler('activity', function(request) {
    var option = request.source;
    if (option.name === "share") {
      var blob = option.data.blob || option.data.blobs[0];
      openEditor(blob);
    }
  });
}
