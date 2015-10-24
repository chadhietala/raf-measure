# rAF Measure

A utility to performantly event scroll and resize events using requestAnimationFrame. This utility also allows you know when a registered element has entered the viewport.

## Usage

### Registering For Scroll Events

```
import measurer from 'raf-measure';

let measureId = measurer.register('scroll', {
  callback({ scrollTop, scrollLeft }) {
    console.log(scrollTop, scrollLeft);
  }
} /*, optional context */);
```

### Registering For Resize Events

```
import measurer from 'raf-measure';

let measureId = measurer.register('resize', {
  callback({ height, width }) {
    console.log(height, width);
  }
} /*, optional context */);
```

### Registering For Elements In View Port

```
import measurer from 'raf-measure';

let measureId = measurer.register('inViewPort', {
  element: document.getElementById('my-div'),
  callback({ height, width }) {
    console.log(height, width);
  }
  // optional hitbox must return a bool
  //, hitbox({elLeft, elTop, elWidth, elHeight}, {clientX, clientY, clientWidth, clientHeight}) {}
} /*, optional context */);
```

### Unregistering Events
```
import measurer from 'raf-measure';

let measureId = measurer.register('inViewPort', {
  element: document.getElementById('my-div'),
  callback({ height, width }) {
    console.log(height, width);
  }
  // optional hitbox must return a bool
  //, hitbox({elLeft, elTop, elWidth, elHeight}, {clientX, clientY, clientWidth, clientHeight}) {}
} /*, optional context */);

measurer.unregister('inViewPort', measureId);
```
