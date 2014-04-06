
var THUMB_SIZE = 60;
var PATH = 'mememe';

var DEFAULT_TITLE = 'Procrastination';
var DEFAULT_EXPLANATION = 'I\'ll find a picture for it later';

var IMAGE_WIDTH = 770;
var IMAGE_HEIGHT = 485;
var IMAGE_PADDING = 75;

var TEXTAREA_OFFSET = 0.77;
var TITLE_FONT_SCALE = 0.12;
var EXPLANATION_FONT_SCALE = 0.06;
var TITLE_HANGING_OFFSET = 0.775;
var EXPLANATION_BOTTOM_OFFSET = 0.98;

var TEMPLATES = window.template.gatherTemplates(document);

var titleInput = document.getElementById('title-input');
var explanationInput = document.getElementById('explanation-input');
var editCloseButton = document.querySelector('#edit-view .close');
var editDoneButton = document.querySelector('#edit-view .done');
var newMemeButton = document.getElementById('new-meme');
var compositionCanvas = document.getElementById('composition-canvas');
var posterList = document.getElementById('poster-list');

var picturesStorage = navigator.getDeviceStorage('pictures');
