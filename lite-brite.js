(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var LiteBrite = (function (_HTMLElement) {
  function LiteBrite() {
    _classCallCheck(this, LiteBrite);
  }

  _inherits(LiteBrite, _HTMLElement);

  _createClass(LiteBrite, {
    createdCallback: {
      value: function createdCallback() {
        var el = this;

        this.background = document.createElement("div");
        this.background.classList.add("background");
      }
    },
    color: {
      set: function (value) {
        localStorage[this.index] = value;

        this.style.background = value;
        this.background.style.background = value;
      }
    },
    attachedCallback: {
      value: function attachedCallback() {
        this.index = [].indexOf.call(this.parentNode.childNodes, this);
        this.color = localStorage[this.index] || "";

        this.background.style.top = this.offsetTop + "px";
        this.background.style.left = this.offsetLeft + "px";
      }
    }
  });

  return LiteBrite;
})(HTMLElement);

document.registerElement("lite-brite", LiteBrite);

// Firefox doesn't like default constructors

},{}]},{},[1]);
