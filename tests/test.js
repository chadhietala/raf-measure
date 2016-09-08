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
    expect(measurer._queues.inViewPort.length).to.eql(1);
  });

  it('should unregister events', (done) => {
    let mScroll = measurer.register('scroll', {
      callback: () => {}
    });

    let mResize = measurer.register('resize', {
      callback: () => {}
    });

    let minViewPort = measurer.register('inViewPort', {
      callback: () => {},
      element: document.querySelector('div')
    });

    expect(measurer._queues.scroll.length).to.eql(1);
    expect(measurer._queues.resize.length).to.eql(1);
    expect(measurer._queues.inViewPort.length).to.eql(1);

    measurer.unregister('scroll', mScroll);
    measurer.unregister('resize', mResize);
    measurer.unregister('inViewPort', minViewPort);

    setTimeout(() => {
      try {
        expect(measurer._queues.scroll.length).to.eql(0);
        expect(measurer._queues.resize.length).to.eql(0);
        expect(measurer._queues.inViewPort.length).to.eql(0);
        done();
      } catch (e) {
        done(e);
      }
    }, 20);
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
      try {
        expect(called).to.eql(true);
        expect(args.direction).to.eql('down');
        expect(args.scrollTop).to.eql(100);
        expect(args.scrollLeft).to.eql(0);
        done();
      } catch (e) {
        done(e);
      }
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
      try {
        expect(called).to.eql(true);
        expect(args).to.be.an('object');
        done();
      } catch (e) {
        done(e);
      }

    }, 25);
  });
});
