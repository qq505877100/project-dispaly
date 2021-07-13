/* 
parent: Node,
position: { x: 10, y: 20 },
target: 'left',
resizePosition: 'left top',
headerStyle: {},
contentStyle: {},
onDragStart: function (e, options) {},
1 参数确认
2 边界问题处理
第一：拖拽容器的时候，限制容器不能超出父元素的范围
第二：在缩放元素的时候，限制缩放有一个最小宽高切不会移动
*/
const createElement = function (tag, className) {
  const dom = document.createElement(tag);
  dom.className = className;
  return dom;
};

function Drag(options) {
  this.draggingClassName = 'dragging';
  const defaultFunc = () => {};
  options = options || {};
  // 容器可以缩放的最小宽高值
  this.MIN_WIDTH = 10;
  this.MIN_HEIGHT = 10;
  // 缩放按钮的初始坐标
  this.resizeDomPositon = {
    left: undefined,
    top: undefined,
  };
  // 配置项初始化
  this.options = Object.assign({}, options, {
    parent: options.parent || document.body,
    position: options.position || { x: 100, y: 100 },
    target: options.target || 'top',
    resizePosition: options.resizePosition || 'right bottom',
    onDragStart: options.onDragStart || defaultFunc,
    onDrag: options.onDrag || defaultFunc,
    onDragEnd: options.onDragEnd || defaultFunc,
  });

  this.container = null;
  this.resizeContainerDom = null;
  // 可拖拽缩放的dom元素
  this.dragResizeDom = null;
  // 可拖拽move的dom元素
  this.dragTargetDom = null;
  // 容器的坐标初始值
  this.containerDx = this.options.position.x;
  this.containerDy = this.options.position.y;
  // 容器的宽高值
  this.containerWidth = 0;
  this.containerHeight = 0;
  // 容器在宽高缩放时，真正增加或减少的增量
  this.realDx = 0;
  this.realDy = 0;

  this.init();
}

Drag.prototype.init = function () {
  // 初始化
  this.generateDoms();
  dragProxy(
    this.dragTargetDom,
    () => {
      this.container.classList.add(this.draggingClassName);
      this.resizeContainerDom.classList.add(this.draggingClassName);
      // 绑定可拖拽区域的事件
      this.options.onDragStart(e);
    },
    (e, delta) => {
      // console.log('dragTargetDom');
      const minLeft = -this.containerWidth / 2;
      const { dx, dy } = delta;
      this.containerDx += dx;
      this.containerDy += dy;
      // 实现一个两个矩形相交的算法即可
      if (this.containerDx <= minLeft) {
        return;
      }
      this.container.style.left = `${this.containerDx}px`;
      this.container.style.top = `${this.containerDy}px`;

      // this.container.style.transform = `translate(${this.containerDx}px, ${this.containerDy}px)`;
      this.changeResizePosition(dx, dy, true);
    },
    (e, delta) => {
      this.container.classList.remove(this.draggingClassName);
      this.resizeContainerDom.classList.remove(this.draggingClassName);
      this.options.onDragEnd(e, delta);
    }
  );

  dragProxy(this.dragResizeDom, null, (e, delta) => {
    const { dx, dy } = delta;
    switch (this.options.resizePosition) {
      case 'left top':
        // 容器宽高变化
        this.containerWidth -= dx;
        this.containerHeight -= dy;
        // 容器坐标值变化
        this.containerDx += dx;
        this.containerDy += dy;
        // 缩放按钮坐标值变化
        this.resizeDomPositon.left += dx;
        this.resizeDomPositon.top += dy;
        break;
      case 'left bottom':
        this.containerWidth -= dx;
        this.containerHeight += dy;
        this.containerDx += dx;
        this.resizeDomPositon.left += dx;
        this.resizeDomPositon.top += dy;
        break;
      case 'right top':
        this.containerWidth += dx;
        this.containerHeight -= dy;
        this.containerDy += dy;
        this.resizeDomPositon.left += dx;
        this.resizeDomPositon.top += dy;
        break;
      case 'right bottom':
        this.containerWidth += dx;
        this.containerHeight += dy;
        this.resizeDomPositon.left += dx;
        this.resizeDomPositon.top += dy;
        break;
      default:
        break;
    }
    if (this.containerWidth >= this.MIN_WIDTH) {
      this.container.style.width = `${this.containerWidth}px`;
      this.container.style.left = `${this.containerDx}px`;
      this.resizeContainerDom.style.left = `${this.resizeDomPositon.left}px`;
    }
    if (this.containerHeight >= this.MIN_WIDTH) {
      this.container.style.height = `${this.containerHeight}px`;
      this.container.style.top = `${this.containerDy}px`;
      this.resizeContainerDom.style.top = `${this.resizeDomPositon.top}px`;
    }
  });
};

/**
 * 动态改变resize按钮的坐标
 * @param {*} dx
 * @param {*} dy
 * @param {*} isDrag 是否是在拖动容器导致的size变化
 */
Drag.prototype.changeResizePosition = function (dx, dy, isDrag) {
  const beforeLeft = this.resizeDomPositon.left;
  const beforeTop = this.resizeDomPositon.top;
  switch (this.options.resizePosition) {
    case 'left top':
      this.resizeDomPositon.left += dx;
      this.resizeDomPositon.top += dy;
      break;
    case 'left bottom':
      this.resizeDomPositon.left += dx;
      this.resizeDomPositon.top += dy;
      break;
    case 'right top':
      this.resizeDomPositon.left += dx;
      this.resizeDomPositon.top += dy;
      break;
    case 'right bottom':
      this.resizeDomPositon.left += dx;
      this.resizeDomPositon.top += dy;
      break;
    default:
      break;
  }
  this.resizeContainerDom.style.left = `${this.resizeDomPositon.left}px`;
  this.resizeContainerDom.style.top = `${this.resizeDomPositon.top}px`;
};

Drag.prototype.generateDoms = function () {
  const _generateContentDom = () => {
    this.container = createElement('div', 'drag-container');
    this.headerDom = createElement('div', 'header');
    this.contentDom = createElement('div', 'content');

    this.container.appendChild(this.headerDom);
    this.container.appendChild(this.contentDom);

    this.container.style.left = `${this.containerDx}px`;
    this.container.style.top = `${this.containerDy}px`;

    if (this.options.target === 'top') {
      this.dragTargetDom = this.headerDom;
    } else {
      this.dragTargetDom = this.contentDom;
    }
    this.options.parent.appendChild(this.container);
    this.containerWidth = this.container.offsetWidth;
    this.containerHeight = this.container.offsetHeight;
  };
  const _generateResizeDom = () => {
    // 支持四个方位
    const offsetLeft = this.container.offsetLeft;
    const offsetTop = this.container.offsetTop;
    const offsetWidth = this.container.offsetWidth;
    const offsetHeight = this.container.offsetHeight;
    const offsetValue = 5;
    offset = {
      left: this.container.offsetLeft,
      top: this.container.offsetTop,
    };
    switch (this.options.resizePosition) {
      case 'left top':
        this.resizeDomPositon.left = offsetLeft + 0 - offsetValue;
        this.resizeDomPositon.top = offsetTop + 0 - offsetValue;
        break;
      case 'left bottom':
        this.resizeDomPositon.left = offsetLeft + 0 - offsetValue;
        this.resizeDomPositon.top = offsetTop + offsetHeight - offsetValue;
        break;
      case 'right top':
        this.resizeDomPositon.left = offsetLeft + offsetWidth - offsetValue;
        this.resizeDomPositon.top = offsetTop - offsetValue;
        break;
      case 'right bottom':
        this.resizeDomPositon.left = offsetLeft + offsetWidth - offsetValue;
        this.resizeDomPositon.top = offsetTop + offsetHeight - offsetValue;
        break;
      default:
        break;
    }
    this.resizeContainerDom = createElement('div', 'resize-container');
    this.dragResizeDom = createElement('div', 'drag-dom');
    Object.keys(this.resizeDomPositon).forEach((key) => {
      if (this.resizeDomPositon[key] !== undefined) {
        this.resizeContainerDom.style[key] = `${this.resizeDomPositon[key]}px`;
      }
    });
    this.resizeContainerDom.appendChild(this.dragResizeDom);
    this.container.parentElement.appendChild(this.resizeContainerDom);
  };

  _generateContentDom();
  _generateResizeDom();
};
