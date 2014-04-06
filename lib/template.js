(function (global) {
  'use strict'

  function Template(reference) {
    var copy = reference.cloneNode(true);
    Object.defineProperty(this, 'reference', { value: copy });
  }

  Template.prototype.render = function (objects) {
    objects = !Array.isArray(objects) ? [objects] : objects;
    var object, fragment = document.createDocumentFragment();
    for (var i = 0, l = objects.length; i < l; i++) {
      object = objects[i];
      fragment.appendChild(this.getFilledWith(object));
    }
    return fragment;
  };

  Template.prototype.getFilledWith = function (object) {
    var html = getHTML(this.reference);
    html = html.replace(/{{\s*(.*?)\s*}}/g, function (matching, id) {
      return id ? getFrom(object, id) : object;
    });
    var container = document.createElement('div');
    container.innerHTML = html;
    delete container.children[0].dataset.template;
    return container.children[0];
  };

  function getHTML(element) {
    var container = document.createElement('div');
    container.appendChild(element.cloneNode(true));
    return container.innerHTML;
  };

  function gatherTemplates(root) {
    var library = {};
    var templates = root.querySelectorAll('[data-template]');
    for (var l = templates.length - 1, node; node = templates[l]; l--) {
      var path = node.dataset.template;
      putIn(library, path, new Template(node));
      node.parentNode.removeChild(node);
    }
    return library;
  };

  function putIn(target, path, object) {
    var tokens = path.split('.');
    var current = tokens[0];
    var remainingPath = tokens.slice(1).join('.');
    if (tokens.length === 1) {
      if (typeof target[current] !== 'undefined') {
        throw new Error('Duplicated id for a template: "' + path + '"');
      }
      target[current] = object;
    }
    else {
      target[current] = target[current] || {};
      putIn(target[current], remainingPath, object);
    }
  }

  function getFrom(target, path) {
    if (target === undefined || target === null) { return target; }

    var tokens = path.split('.');
    var current = tokens[0];
    var remainingPath = tokens.slice(1).join('.');
    if (tokens.length === 1) {
      return target[current];
    }
    else {
      return getFrom(target[current], remainingPath);
    }
  }

  global.template = {
    Template: Template,
    getHTML: getHTML,
    gatherTemplates: gatherTemplates
  };

}(this));
