# rAF Measure

A utility to performantly to event scroll and resize handlers in the browser using requestAnimationFrame. This utility also allows you know when a registered element has entered the viewport.

## Usage

### Registering For Scroll Events

```
import measurer from 'raf-measure';

measurer.register('scroll', {
  callback({ scrollTop, scrollLeft }) {
    console.log(scrollTop, scrollLeft);
  }
} /*, optional context */);
```

### Registering For Resize Events

```
import measurer from 'raf-measure';

measurer.register('resize', {
  callback({ height, width }) {
    console.log(height, width);
  }
} /*, optional context */);
```

### Registering For Elements In View Port

```
import measurer from 'raf-measure';

measurer.register('inViewPort', {
  element: document.getElementById('my-div'),
  callback({ height, width }) {
    console.log(height, width);
  }
  // optional hitbox must return a bool
  //, hitbox({elLeft, elTop, elWidth, elHeight}, {clientX, clientY, clientWidth, clientHeight}) {}
} /*, optional context */);
```