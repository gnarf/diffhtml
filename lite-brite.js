'use strict';

class LiteBrite extends HTMLElement {
  constructor() {
    // Firefox doesn't like default constructors
  }

  createdCallback() {
    var el = this;

    this.background = document.createElement('div');
    this.background.classList.add('background');

    document.querySelector('#backgrounds').appendChild(this.background);
  }

  set color(value) {
    localStorage[this.index] = value;

    this.style.background = value;
    this.background.style.background = value;
  }

  attachedCallback() {
    this.index = [].indexOf.call(this.parentNode.childNodes, this);
    this.color = localStorage[this.index] || '';

    this.background.style.top = this.offsetTop + 'px';
    this.background.style.left = this.offsetLeft + 'px';
  }
}

document.registerElement('lite-brite', LiteBrite);
