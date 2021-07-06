/**
 * 给元素绑定mousedown/mousemove/mouseup事件（也就是拖拽事件）
 * 动态的计算每次move时x/y方向上的偏移量
 * @param {*} dom
 * @param {*} onDragStart
 * @param {*} onDrag
 * @param {*} onDragEnd
 */
const dragProxy = (dom, onDragStart, onDrag, onDragEnd) => {
  onDragStart = onDragStart || (() => {});
  onDrag = onDrag || (() => {});
  onDragEnd = onDragEnd || (() => {});

  let pageX;
  let pageY;
  let delta = {
    dx: 0,
    dy: 0,
  };
  const mousestart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    console.log(e.target !== dom);
    if (e.target !== dom) {
      return;
    }
    pageX = e.pageX;
    pageY = e.pageY;
    window.addEventListener('mousemove', mousemove);
    window.addEventListener('mouseup', mouseend);
    onDragStart(e);
  };

  const mousemove = (e) => {
    e.preventDefault();
    const currentPageX = e.pageX;
    const currentPageY = e.pageY;
    const dx = currentPageX - pageX;
    const dy = currentPageY - pageY;
    pageX = currentPageX;
    pageY = currentPageY;
    delta = {
      dx,
      dy,
    };
    onDrag(e, delta);
  };

  const mouseend = (e) => {
    e.preventDefault();
    window.removeEventListener('mousemove', mousemove);
    window.removeEventListener('mouseup', mouseend);
    onDragEnd(e, delta);
  };
  window.addEventListener('mousedown', mousestart);
};

// 只代理鼠标滚动的距离
const dragProxy2 = (onDrag, onDragEnd) => {
  let startPosition;
  onDrag = onDrag || (() => {});
  onDragEnd = onDragEnd || (() => {});

  let delta = {
    dx: 0,
    dy: 0,
  };

  const mousemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!startPosition) {
      startPosition = {
        x: e.pageX,
        y: e.pageY,
      };
    }
    const x = e.pageX - startPosition.x;
    const y = e.pageY - startPosition.y;
    delta = {
      x,
      y,
    };
    console.log('func22');
    console.log(delta);
    onDrag(e, delta);
  };

  const mouseend = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.removeEventListener('mousemove', mousemove);
    window.removeEventListener('mouseup', mouseend);
    onDragEnd(e, delta);
  };
  window.addEventListener('mousemove', mousemove);
  window.addEventListener('mouseup', mouseend);
};
