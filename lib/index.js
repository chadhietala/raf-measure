const resize = 'resize';
const inViewPort = 'inViewPort';
const scrolling = 'scroll';

// Default box finding
const box = ({elLeft, elTop, elWidth, elHeight}, {clientX, clientY, clientWidth, clientHeight}) => {
  return elLeft <= clientX + clientWidth && elLeft + elWidth >= clientX && top <= clientY + clientHeight && elHeight + elTop >= clientY;
};

const isBrowser = (typeof window !== 'undefined') && window && (typeof document !== 'undefined') && document;

const guid = (() => {
  let i = -1;
  return () => `measure-${i + 1}`;
})();

const measure = {
  _queues: {
    [resize]: [],
    [inViewPort]: [],
    [scrolling]: []
  },

  paused: false,

  _initialValues: {
    clientHeight: 800,
    clientWidth: 800,
    clientX: 0,
    clientY: 0,
    scrollTop: 0,
    scrollLeft: 0
  },

  startPolling() {
    const self = this;
    this.paused = false;

    function step() {
      self.fire();
      if (!this.paused) {
        nextStep();
      }
    }

    function nextStep() {
      self._animationFrame = requestAnimationFrame(step);
    }

    nextStep();
  },

  pause() {
    this.paused = true;
  },

  register(queueName, { element = null, callback, hitbox = box }, context) {
    if (isBrowser) {
      let id = guid();
      callback = callback.bind(context);
      this._queues[queueName].push({
        guid: id,
        element,
        callback,
        hitbox
      });
      return id;
    }
  },

  unregister(queueName, id) {
    for (let i = 0, l = this._queues[queueName].length; i < l; i++) {
      let { guid: taskId } = this._queues[i];
      if (taskId === id) {
        this._queues.splice(i, 1);
        break;
      }
    }
  },

  unregisterAll() {
    Object.keys(this._queues).forEach((queue) => {
      this._queues[queue] = [];
    });
  },

  cancelAnimationFrame() {
    if (this._animationFrame) {
      cancelAnimationFrame(this._animationFrame);
      this._animationFrame = undefined;
    }
  },

  // Override in Ember-land
  fire() {
    this.flushQueues();
  },

  flushQueues() {
    this.flushScroll(this._queues[scrolling]);
    this.flushInViewPort(this._queues[inViewPort]);
    this.flushResize(this._queues[resize]);
  },

  flushScroll(queue) {
    if (queue.length > 0) {
      let { documentElement: { scrollTop } } = document;
      let { documentElement: { scrollLeft } } = document;
      let { scrollTop: initScrollTop, scrollLeft: initScrollLeft } = this._initialValues;
      let didVerticalScroll = scrollTop !== initScrollTop;
      let didHorizontalScroll = scrollLeft !== initScrollLeft;
      let direction = (didVerticalScroll ? (scrollTop > initScrollTop ? 'down' : 'top') : null) ||
                (didHorizontalScroll ? (scrollLeft > initScrollLeft ? 'right' : 'left') : null);

      if (didVerticalScroll || didHorizontalScroll) {
        for (let i = 0, l = queue.length; i < l; i++) {
          let { callback } = queue[i];
          callback({scrollTop, scrollLeft, direction});
        }

        this._initialValues.scrollTop = scrollTop;
        this._initialValues.scrollLeft = scrollLeft;
      }
    }
  },

  flushInViewPort(queue) {
    if (queue.length > 0) {
      let clientHeight = document.documentElement.clientHeight;
      let clientWidth = document.documentElement.clientWidth;
      let { clientY, clientX } = this._initialValues;

      for (let i = 0, l = queue.length; i < l; i++) {
        let { element, callback, hitbox } = queue[i];
        let bounding = element.getBoundingClientRect();

        if (hitbox(bounding, {
          clientX,
          clientY,
          clientWidth,
          clientHeight
        })) {
          callback(element, bounding);
        }
      }
    }
  },

  flushResize(queue) {
    if (queue.length > 0) {
      let { clientHeight: initHeight, clientWidth: initWidth } = this._initialValues;
      let clientHeight = document.documentElement.clientHeight;
      let clientWidth = document.documentElement.clientWidth;
      let didResize = !!(clientHeight !== initHeight || clientWidth !== initWidth);

      if (didResize) {
        for (let i = 0, l = queue.length; i < l; i++) {
          let { callback } = queue[i];
          callback({
            height: clientHeight,
            width: clientWidth
          });
        }
        this._initialValues.clientHeight = clientHeight;
        this._initialValues.clientWidth = clientWidth;
      }
    }
  }
};

if (isBrowser) {
  measure.startPolling();
}

export default measure;