/* 
  实现的功能：一个可拖拽的容器
  要求：
  1 用户可以自定义可拖拽部分，默认整个容器可以拖拽
  2 可缩放，级即用户可以定义在四个角进行缩放
  实现思路：
  1 用户传入一个容器进来。
  2 然后给这个容器绑定事件，计算拖动过程中水平、垂直方向上的偏移量，从而动态的修正元素的
  x、y坐标值，从而达到拖拽的效果。
  3 实现缩放效果，原理：也是计算拖拽过程中x/y方向上的偏移量，从而按照一定的比例映射到元素
  的宽高大小上，实现拖拽效果。

  参数介绍：
  1 container: 要被拖拽的容器
  2 options: 配置如下
  属性：
  target: '', 拖拽的目标容器
  resizePosition: 'left top',
  方法：
  onDragStart(event): 表示拖拽开始瞬间
  onDrag(event, delta: {dx, dy}): 表示拖拽开始瞬间
  onDragEnd(event, delta: {dx, dy}): 表示拖拽开始瞬间

  第一版优化的点：
  存在的问题：就是那个缩放按钮，必要要求container容器是一个定位容器，否则无法定位
  优化后：不强制要求container容器是一个定位元素，也可以实现缩放按钮的定位
  优化原理：使用container容器的offsetLeft/offsetTop进行初始定位，当拖拽缩放按钮时，
  动态的改变按钮的位置信息，达到联动的效果
  */
function drag(container, options) {
  const defaultFunc = () => {};
  options = options || {};
  options.onDragStart = options.onDragStart || defaultFunc;
  options.onDrag = options.onDrag || defaultFunc;
  options.onDragEnd = options.onDragEnd || defaultFunc;

  let target = options.target;
  let resizePosition = options.resizePosition || 'right bottom';
  let resizeContainerDom;
  let dragResizeDom;
  // 容器可以缩放的最小宽高值
  const MIN_WIDTH = 10;
  const MIN_HEIGHT = 10;
  // 缩放按钮的初始坐标
  const resizeDomPositon = {
    left: undefined,
    top: undefined,
  };
  // 容器的坐标初始值
  let containerDx = 0;
  let containerDy = 0;
  // 容器的宽高值
  let containerWidth = 0;
  let containerHeight = 0;
  // 容器在宽高缩放时，真正增加或减少的增量
  let realDx;
  let realDy;

  createElement = function (tag, className) {
    const dom = document.createElement(tag);
    dom.className = className;
    return dom;
  };

  const generateResizeDom = () => {
    // 支持四个方位
    const offsetLeft = container.offsetLeft;
    const offsetTop = container.offsetTop;
    const offsetWidth = container.offsetWidth;
    const offsetHeight = container.offsetHeight;
    const HALF_WIDTH = 10 / 2;
    const HALF_HEIGHT = 10 / 2;

    switch (resizePosition) {
      case 'left top':
        resizeDomPositon.left = offsetLeft - HALF_WIDTH;
        resizeDomPositon.top = offsetTop - HALF_HEIGHT;
        break;
      case 'left bottom':
        resizeDomPositon.left = offsetLeft - HALF_WIDTH;
        resizeDomPositon.top = offsetTop + offsetHeight - HALF_HEIGHT;
        break;
      case 'right top':
        resizeDomPositon.left = offsetLeft + offsetWidth - HALF_WIDTH;
        resizeDomPositon.top = offsetTop - HALF_HEIGHT;
        break;
      case 'right bottom':
        resizeDomPositon.left = offsetLeft + offsetWidth - HALF_WIDTH;
        resizeDomPositon.top = offsetTop + offsetHeight - HALF_HEIGHT;
        break;
      default:
        break;
    }
    _generateResizeDom = () => {
      resizeContainerDom = createElement('div', 'position-container');
      dragResizeDom = createElement('div', 'drag-dom');
      Object.keys(resizeDomPositon).forEach((key) => {
        if (resizeDomPositon[key] !== undefined) {
          resizeContainerDom.style[key] = `${resizeDomPositon[key]}px`;
        }
      });
      resizeContainerDom.appendChild(dragResizeDom);
      container.parentElement.appendChild(resizeContainerDom);
    };
    _generateResizeDom();
  };

  const bindDrag = () => {
    const _onDragStart = (e) => {
      options.onDragStart(e);
    };
    const _onDrag = (e, delta) => {
      const { dx, dy } = delta;
      containerDx += dx;
      containerDy += dy;
      container.style.transform = `translate(${containerDx}px, ${containerDy}px)`;
      // console.log('我是拖动父容器进行拖拽');
      changeResizePosition(dx, dy, true);
    };
    const _onDragEnd = (e, delta) => {
      options.onDragEnd(e, delta);
    };
    dragProxy(target, _onDragStart, _onDrag, _onDragEnd);
  };

  /**
   * 动态改变容器的宽高值
   * @param {d} dx
   * @param {*} dy
   */
  const changeContainerWidth = (dx, dy) => {
    const beforeContainerWidth = containerWidth;
    const beforeContainerHeight = containerHeight;
    switch (resizePosition) {
      case 'left top':
        containerWidth -= dx;
        containerHeight -= dy;
        break;
      case 'left bottom':
        containerWidth -= dx;
        containerHeight += dy;
        break;
      case 'right top':
        containerWidth += dx;
        containerHeight -= dy;
        break;
      case 'right bottom':
        containerWidth += dx;
        containerHeight += dy;
        break;
      default:
        break;
    }
    // 限定最小高度、宽度
    containerWidth = Math.max(MIN_WIDTH, containerWidth);
    containerHeight = Math.max(MIN_HEIGHT, containerHeight);
    realDx = containerWidth - beforeContainerWidth;
    realDy = containerHeight - beforeContainerHeight;
    // console.log(realDy, realDy);
    container.style.width = `${containerWidth}px`;
    container.style.height = `${containerHeight}px`;
    return {
      containerWidth,
      containerHeight,
    };
  };

  /**
   * 缩放的时候，需要动态的修正容器的坐标值
   * 原理：
   * width在增加或者减少的时候，会往两边均匀增加，所以我们的坐标值需要+或-(dx / 2)的一半，
   * 这样就可以做到容器width在变化时，固定一条边进行宽度的缩放。
   * @param {*} dx
   * @param {*} dy
   */
  const changeContainerPosition = (dx, dy) => {
    const beforecontainerDx = containerDx;
    const beforecontainerDy = containerDy;
    switch (resizePosition) {
      case 'left top':
        containerDx += dx / 2;
        containerDy += dy;
        break;
      case 'left bottom':
        containerDx += dx / 2;
        break;
      case 'right top':
        containerDx += dx / 2;
        containerDy += dy;
        break;
      case 'right bottom':
        containerDx += dx / 2;
        break;
      default:
        break;
    }
    if (containerWidth <= MIN_WIDTH) {
      containerDx = beforecontainerDx + realDx / 2;
    }
    if (containerHeight <= MIN_HEIGHT) {
      containerDy = beforecontainerDy + realDy;
    }
    container.style.transform = `translate(${containerDx}px, ${containerDy}px)`;
    return {
      containerDx,
      containerDy,
    };
  };

  /**
   * 动态改变resize按钮的坐标
   * @param {*} dx
   * @param {*} dy
   * @param {*} isDrag 是否是在拖动容器导致的size变化
   */
  const changeResizePosition = (dx, dy, isDrag) => {
    const beforeLeft = resizeDomPositon.left;
    const beforeTop = resizeDomPositon.top;
    switch (resizePosition) {
      case 'left top':
        resizeDomPositon.left += dx;
        resizeDomPositon.top += dy;
        break;
      case 'left bottom':
        resizeDomPositon.left += dx;
        resizeDomPositon.top += dy;
        break;
      case 'right top':
        resizeDomPositon.left += dx;
        resizeDomPositon.top += dy;
        break;
      case 'right bottom':
        resizeDomPositon.left += dx;
        resizeDomPositon.top += dy;
        break;
      default:
        break;
    }
    // console.log('containerWidth', containerWidth);
    // console.log('containerWidth', containerHeight);

    // 宽度限制
    if (containerWidth <= MIN_WIDTH) {
      resizeDomPositon.left = beforeLeft + realDx;
    }
    if (containerHeight <= MIN_HEIGHT) {
      resizeDomPositon.top = beforeTop + realDy;
    }
    resizeContainerDom.style.left = `${resizeDomPositon.left}px`;
    resizeContainerDom.style.top = `${resizeDomPositon.top}px`;
  };

  const bindResize = () => {
    const _onDrag = (e, delta) => {
      const { dx, dy } = delta;
      // 改变容器的width、height
      changeContainerWidth(dx, dy);
      // 同步容器的坐标，保证宽高在变化的时候，坐标值不变
      changeContainerPosition(dx, dy);
      // 改变resize按钮的坐标
      changeResizePosition(dx, dy);
    };
    const _onDragEnd = (e, delta) => {
      options.onDragEnd(e, delta);
    };
    dragProxy(dragResizeDom, null, _onDrag, _onDragEnd);
    dragResizeDom.addEventListener('mousedown', () => {
      // dragProxy2();
    });
  };

  const bindEvents = () => {
    bindDrag();
    bindResize();
  };

  const calcData = () => {
    containerWidth = container.offsetWidth;
    containerHeight = container.offsetHeight;
  };
  const init = () => {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    if (!container) {
      throw new Error('container is not Empty!');
    }
    if (!options.target) {
      target = container;
    }
    calcData();
    generateResizeDom();
    bindEvents();
  };
  init();
}
