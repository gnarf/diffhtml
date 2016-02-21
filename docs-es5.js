(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var editor = document.querySelector('.editor');
var json = document.querySelector('.json');
var output = document.querySelector('output');

diff.enableProllyfill();

function text(node) {
  return [].reduce.call(node.childNodes, function (memo, node) {
    if (node.nodeType === 3) {
      memo.push(node.nodeValue);
      return memo;
    }

    return memo.concat(text(node));
  }, []).join('');
}

var defaults = {
  editorText: `<img
  width="144px"
  src="kiwi.png"
  style="
  	transform:
    	translate({{translate}})
        rotate({{rotate}})
  "
/>`,
  jsonText: `{
  "translate": ["0px", 0],
  "rotate": "185deg"
}`
};

var isRunning = false;
var interval = null;
var x = 0;
var rotate = 0;
var increment = 0;
var offset = output.offsetWidth;

function runAnimation() {
  if (!isRunning) {
    rotate = 0;
    isRunning = true;
    offset = output.offsetWidth;
    increment = (x ? -10 : 10) * 1;

    function animate() {
      x += increment;
      rotate += increment;
      rotate = rotate % 360;

      update(null, `{
  "translate": "${ x }px, 0",
  "rotate": "${ rotate }deg"
}`);

      if (x > offset - 200) {
        isRunning = false;
        x = offset - 200;
      } else if (x <= 0) {
        isRunning = false;
        x = 0;
      } else {
        requestAnimationFrame(animate);
      }
    }

    animate();
  }
}

function update(editorText, jsonText) {
  editorText = typeof editorText === 'string' ? editorText : defaults.editorText;
  jsonText = typeof jsonText === 'string' ? jsonText : defaults.jsonText;

  defaults.editorText = editorText;
  defaults.jsonText = jsonText;

  var data = JSON.parse(jsonText);
  var markup = Mustache.render(editorText, data);

  //json.classList.remove('error');
  diff.innerHTML(output, markup);
  //editor.classList.remove('error');

  if (jsonMirror) {
    //jsonMirror.setValue(jsonText);
  }
}

update();

var editorMirror = makeCodeMirror(editor, 'editorText');
var jsonMirror = makeCodeMirror(json, 'jsonText');

jsonMirror.on('change', function (ev) {
  var editorText = typeof editorText === 'string' ? editorText : defaults.editorText;
  var jsonText = jsonMirror.getValue();
  var data = JSON.parse(jsonText);
  var markup = Mustache.render(editorText, data);

  diff.innerHTML(output, markup);
});

// Whenever the editor changes, re-render.
editorMirror.on('change', function (ev) {
  var contents = editorMirror.getValue();

  if (editor.classList.contains('editor')) {
    update(contents);
  } else {
    update(null, contents);
  }
});

function makeCodeMirror(el, name) {
  return CodeMirror(el, { lineWrapping: true, value: defaults[name] });
}

document.querySelector('.run-animation').onclick = runAnimation;

var fav = document.querySelector('favorite-movies-chart');

function renderFavoriteMoviesLoop() {
  if (fav.render) {
    fav.render();
  }

  requestAnimationFrame(renderFavoriteMoviesLoop);
}

renderFavoriteMoviesLoop();

document.querySelector('.re-render').onclick = function () {
  fav.makeData();
};

document.querySelector('aside h1').onclick = function (ev) {
  ev.preventDefault();
  document.body.scrollTop = 0;
};

document.querySelector('.board').onmouseover = function (ev) {
  if (ev.target.nodeName.toLowerCase() === 'lite-brite') {
    ev.target.color = document.querySelector('input[type=color]').value;
  }
};

document.querySelector('.board').onmouseenter = function (ev) {
  if (ev.target.nodeName.toLowerCase() === 'lite-brite') {
    ev.target.color = document.querySelector('input[type=color]').value;
  }
};

[...document.querySelectorAll('h2[id]')].forEach(el => el.onclick = ev => {
  location.hash = el.id;
});

},{}]},{},[1]);
