import measurer from 'raf-measure';

window.measurer = measurer;

describe('raf-measure', () => {
  afterEach(() => {
    window.scrollTo(0, 0);
    measurer.unregisterAll();
  });

  it('should place handlers in the queue', () => {
    measurer.register('scroll', {
      callback: () => {}
    });

    measurer.register('resize', {
      callback: () => {}
    });

    measurer.register('inViewPort', {
      callback: () => {},
      element: document.querySelector('div')
    });
    expect(measurer._queues.scroll.length).to.eql(1);
    expect(measurer._queues.resize.length).to.eql(1);
    expect(measurer._queues.scroll.length).to.eql(1);
  });

  it('should fire the scroll handler when scroll happens', (done) => {
    let called = false;
    let args;
    measurer.register('scroll', {
      callback: (position) => {
        args = position;
        called = true;
      }
    });

    window.scrollTo(0, 100);

    setTimeout(() => {
      expect(called).to.eql(true);
      expect(args.direction).to.eql('down');
      expect(args.scrollTop).to.eql(100);
      expect(args.scrollLeft).to.eql(0);
      done();
    }, 25);
  });

  it('should fire the inViewPort handler when element enters the viewport', (done) => {
    let called = false;
    let args;
    measurer.register('inViewPort', {
      callback: (element, bounding) => {
        args = bounding;
        called = true;
      },
      element: document.getElementById('marker')
    });

    window.scrollTo(0, 2000);

    setTimeout(() => {
      expect(called).to.eql(true);
      expect(args).to.be.an('object');
      done();
    }, 25);
  });
});
