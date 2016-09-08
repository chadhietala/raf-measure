// Default box finding
const box = ({left: elLeft, top: elTop, width: elWidth, height: elHeight}, {clientX, clientY, clientWidth, clientHeight}) => {
  return elLeft < clientX + clientWidth &&
         elLeft + elWidth > clientX &&
         elTop < clientY + clientHeight &&
         elHeight + elTop > clientY;
};

const isBrowser = (typeof window !== 'undefined') && window && (typeof document !== 'undefined') && document && window.requestAnimationFrame;

const nextGuid = (() => {
  let i = -1;
  return () => `measure-${i++}`
})();

const measure = {
  _queues: {
    resize: [],
    inViewPort: [],
    scroll: [],
    deletes: []
  },

  paused: false,

  _initialValues: {
    clientHeight: undefined,
    clientWidth: undefined,
    clientX: 0,
    clientY: 0,
    scrollTop: 0,
    scrollLeft: 0
  },

  startPolling() {
    const self = this;
    this.paused = false;

    function step() {
      self.flushQueues();
      if (!self.paused) {
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
      let guid = nextGuid();

      if (context) {
        callback = callback.bind(context);
      }

      this._queues[queueName].push({
        guid,
        element,
        callback,
        hitbox
      });

      return guid;
    }
  },

  unregister(queueName, guid) {
    this._queues.deletes.push({
      queueName,
      guid,
    });
  },

  unregisterAll() {
    Object.keys(this._queues).forEach(queue => this._queues[queue].length = 0);
  },

  cancelAnimationFrame() {
    if (this._animationFrame) {
      cancelAnimationFrame(this._animationFrame);
      this._animationFrame = undefined;
    }
  },

  flushQueues() {
    this.flushScroll(this._queues.scroll);
    this.flushInViewPort(this._queues.inViewPort);
    this.flushResize(this._queues.resize);
    this.flushDeletes(this._queues.deletes);
  },

  flushScroll(queue) {
    if (queue.length > 0) {
      let { body: { scrollTop } } = document;
      let { body: { scrollLeft } } = document;
      let { scrollTop: initScrollTop, scrollLeft: initScrollLeft } = this._initialValues;
      let didVerticalScroll = scrollTop !== initScrollTop;
      let didHorizontalScroll = scrollLeft !== initScrollLeft;
      let direction = (didVerticalScroll ? (scrollTop > initScrollTop ? 'down' : 'up') : null) ||
                (didHorizontalScroll ? (scrollLeft > initScrollLeft ? 'right' : 'left') : null);

      if (didVerticalScroll || didHorizontalScroll) {
        for (let i = 0, l = queue.length; i < l; i++) {
          let { callback } = queue[i];
          callback({scrollTop, scrollLeft, direction});
        }
      }

      this._initialValues.scrollTop = scrollTop;
      this._initialValues.scrollLeft = scrollLeft;
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
        let inView = hitbox(bounding, {
          clientX,
          clientY,
          clientWidth,
          clientHeight
        });

        if (inView && callback.state !== 'in') {
          callback(element, bounding, true);
          callback.state = 'in';
        } else if (!inView && callback.state !== 'out') {
          callback(element, bounding, false);
          callback.state = 'out';
        }
      }
    }
  },

  flushDeletes(queue) {
    if (queue.length > 0) {
      for (let i = 0, l = queue.length; i < l; i++) {
        let { guid, queueName } = queue[i];

        for (let j = this._queues[queueName].length; j > 0; --j) {
          let index = j - 1;
          let { guid: taskId } = this._queues[queueName][index];

          if (taskId === guid) {
            this._queues[queueName].splice(index, 1);
            break;
          }
        }
      }
      queue.length = 0;
    }
  },

  flushResize(queue) {
    if (queue.length > 0) {
      let clientHeight = document.documentElement.clientHeight;
      let clientWidth = document.documentElement.clientWidth;
      let { clientHeight: initHeight = clientHeight, clientWidth: initWidth = clientWidth } = this._initialValues;
      let didResize = !!(clientHeight !== initHeight || clientWidth !== initWidth);

      if (didResize) {
        for (let i = 0, l = queue.length; i < l; i++) {
          let { callback } = queue[i];
          callback({
            height: clientHeight,
            width: clientWidth
          });
        }
      }

      this._initialValues.clientHeight = clientHeight;
      this._initialValues.clientWidth = clientWidth;
    }
  }
};

if (isBrowser) {
  measure.startPolling();
}

export default measure;
