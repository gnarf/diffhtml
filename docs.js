var editor = document.querySelector('.editor');
var json = document.querySelector('.json');
var output = document.querySelector('output');

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
    x = 0;
    rotate = 0;
    isRunning = true;

    interval = setInterval(function() {
      x += 10;
      rotate += 10;
      rotate = rotate % 360;

      update(null, `{
  "translate": "${x}px, 0",
  "rotate": "${rotate}deg"
}`);

      if (x > (output.offsetWidth - 200)) {
        clearInterval(interval);
        isRunning = false;
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

editorMirror.on('change', function(ev) {
  var contents = codeMirror.getValue();

  if (el.classList.contains('editor')) {
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
