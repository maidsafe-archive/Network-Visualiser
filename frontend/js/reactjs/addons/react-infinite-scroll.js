;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function topPosition(domElt) {
  if (!domElt) {
    return 0;
  }
  return domElt.offsetTop + topPosition(domElt.offsetParent);
}

module.exports = function (React) {
  if (React.addons && React.addons.InfiniteScroll) {
    return React.addons.InfiniteScroll;
  }
  React.addons = React.addons || {};
  var InfiniteScroll = React.addons.InfiniteScroll = React.createClass({
    getDefaultProps: function () {
      return {
        pageStart: 0,
        hasMore: false,
        loadMore: function () {},
        threshold: 250,
        loader: InfiniteScroll._defaultLoader,
        scrollElement: null
      };
    },
    componentDidMount: function () {
      this.pageLoaded = this.props.pageStart;
      this.attachScrollListener();
    },
    componentDidUpdate: function () {
      this.attachScrollListener();
    },
    render: function () {
      var props = this.props;
      return React.DOM.div(null, props.children, props.hasMore && props.loader);
    },
    scrollListener: function () {
      var el = this.getDOMNode();
      var scrollTop;
      if (this.props.scrollElement) {
        scrollTop = this.props.scrollElement.scrollTop;
      } else {
        scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
      }

      if (topPosition(el) + el.offsetHeight - scrollTop - window.innerHeight < Number(this.props.threshold)) {
        this.detachScrollListener();
        // call loadMore after detachScrollListener to allow
        // for non-async loadMore functions
        this.props.loadMore(this.pageLoaded += 1);
      }
    },
    attachScrollListener: function () {
      if (!this.props.hasMore) {
        return;
      }
      var scrollElement = this.props.scrollElement || window;
      scrollElement.addEventListener('scroll', this.scrollListener);
      window.addEventListener('resize', this.scrollListener);
      this.scrollListener();
    },
    detachScrollListener: function () {
      var scrollElement = this.props.scrollElement || window;
      scrollElement.removeEventListener('scroll', this.scrollListener);
      window.removeEventListener('resize', this.scrollListener);
    },
    componentWillUnmount: function () {
      this.detachScrollListener();
    }
  });
  InfiniteScroll.setDefaultLoader = function (loader) {
    InfiniteScroll._defaultLoader = loader;
  };
  return InfiniteScroll;
};
},{}],2:[function(require,module,exports){
/*global define*/
var reactInfiniteScroll = require('./react-infinite-scroll');
if (typeof define === 'function' && define.amd) {
  define(['react'], function (React) {
    return reactInfiniteScroll(React);
  });
} else {
  window.React.addons = window.React.addons || {};
  window.React.addons.InfiniteScroll = reactInfiniteScroll(window.React);
}
},{"./react-infinite-scroll":1}]},{},[2])
;