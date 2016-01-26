var editor = document.querySelector('.editor');
var json = document.querySelector('.json');
var output = document.querySelector('output');

diff.enableProllyfill();

function text(node) {
  return [].reduce.call(node.childNodes, function(memo, node) {
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
}

var isRunning = false;
var interval = null;
var x = 0;
var rotate = 0;

function runAnimation() {
  if (!isRunning) {
    rotate = 0;
    isRunning = true;
    increment = x ? -10 : 10;

    requestAnimationFrame(function animate() {
      x += increment;
      rotate += increment;
      rotate = rotate % 360;

      update(null, `{
  "translate": "${x}px, 0",
  "rotate": "${rotate}deg"
}`);

      if (x > (output.offsetWidth - 200)) {
        isRunning = false;
      }
      else if (x <= 0) {
        isRunning = false;
      }
      else {
        requestAnimationFrame(animate);
      }
    }, 30);
  }
}

function update(editorText, jsonText) {
  editorText = typeof editorText === 'string' ? editorText : defaults.editorText;
  jsonText = typeof jsonText === 'string' ? jsonText : defaults.jsonText;

  defaults.editorText = editorText;
  defaults.jsonText = jsonText;

  try {
    var data = JSON.parse(jsonText);
    var markup = Mustache.render(editorText, data);

    json.classList.remove('error');
    diff.innerHTML(output, markup);
    editor.classList.remove('error');

    if (jsonMirror) {
      jsonMirror.setValue(jsonText);
    }
  } catch(ex) {
    if (ex.message.indexOf('JSON') === 0) {
      json.classList.add('error');
    }
    else {
      editor.classList.add('error');
    }
  }
}

update();

var editorMirror = makeCodeMirror(editor, 'editorText');
var jsonMirror = makeCodeMirror(json, 'jsonText');

jsonMirror.on('change', function(ev) {
  var editorText = typeof editorText === 'string' ? editorText : defaults.editorText;
  var jsonText = jsonMirror.getValue();
  var data = JSON.parse(jsonText);
  var markup = Mustache.render(editorText, data);

  diff.innerHTML(output, markup);
});

// Whenever the editor changes, re-render.
editorMirror.on('change', function(ev) {
  var contents = editorMirror.getValue();

  if (editor.classList.contains('editor')) {
    update(contents);
  }
  else {
    update(null, contents);
  }
});

function makeCodeMirror(el, name) {
  return CodeMirror(el, { lineWrapping: true, value: defaults[name] });
}

document.querySelector('.run-animation').onclick = runAnimation;

document.querySelector('.re-render').onclick = function() {
  document.querySelector('favorite-movies-chart').randomizeAndRender();
}

document.querySelector('aside h1 img').onclick = function(ev) {
  ev.preventDefault();
  document.body.scrollTop = 0;
};

document.querySelector('.board').onmouseover = function(ev) {
  if (ev.target.nodeName.toLowerCase() === 'lite-brite') {
    ev.target.color = document.querySelector('input[type=color]').value;
  }
};
