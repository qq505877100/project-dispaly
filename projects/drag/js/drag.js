/* 
// 要求父级容器的position属性必须是除了static之外的值
// 默认会限制元素在父元素范围内拖拽移动
parent: Node,
position: { x: 10, y: 20 },
target: 'left',
resizePosition: 'left top',
headerStyle: {},
contentStyle: {},
onDragStart: function (e, options) {},
1 参数确认
2 边界问题处理
(1) 拖拽容器的时候，限制容器不能超出父元素的范围。
解决方案：就是计算容器是否和父级区域有相交部分，如果不相交，那么就不做处理。
(2) 在缩放元素的时候，限制缩放有一个最小宽高切不会移动。
当缩放元素到最小宽高的时候，那么我们就不做处理即可。
3 遇到的问题：
(1) 在拖拽容器移动的时候，当拖拽到边缘区域又反方向拖出来，会导致缩放按钮的位置异常
原因：就是当位于边缘区域是，计算的dx dy偏移量有误差，所以才导致这个问题的发生。
解决方案：就是记录当前容器的真实坐标值，然后通过最新坐标值减去之前坐标值，这样算出来的
dx dy都是准确的（正确的描述了容器移动的偏移量），从而解决了这个问题。
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
    target: options.target,
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
  //
  this.parentRect = null;
  // 容器的计算坐标值（计算出来的可能是异常坐标值）
  this.containerDx = this.options.position.x;
  this.containerDy = this.options.position.y;
  // 容器的真实坐标值（容器真正的坐标值）
  this.containerCurrDx = this.containerDx;
  this.containerCurrDy = this.containerDy;
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
    (e) => {
      this.container.classList.add(this.draggingClassName);
      this.resizeContainerDom.classList.add(this.draggingClassName);
      // 绑定可拖拽区域的事件
      this.options.onDragStart(e);
    },
    (e, delta) => {
      const minLeft = -this.containerWidth / 2;
      const maxLeft = this.parentRect.width - this.containerWidth / 2;

      let { dx, dy } = delta;
      const beforeContainerDx = this.containerDx;
      const beforeContainerDy = this.containerDy;
      this.containerDx += dx;
      this.containerDy += dy;
      // 实现一个两个矩形相交的算法即可
      const containerRect = {
        width: this.containerWidth,
        height: this.containerHeight,
        centerX: this.containerDx + this.containerWidth / 2,
        centerY: this.containerDy + this.containerHeight / 2,
      };
      const isIntersect = isIntersectRect(
        containerRect,
        this.parentRect,
        this.containerWidth / 2,
        this.containerHeight / 2
      );
      if (!isIntersect) {
        return;
      }
      dx = this.containerDx - this.containerCurrDx;
      dy = this.containerDy - this.containerCurrDy;
      this.container.style.left = `${this.containerDx}px`;
      this.container.style.top = `${this.containerDy}px`;
      this.containerCurrDx = this.containerDx;
      this.containerCurrDy = this.containerDy;

      // 矫正一下偏移量
      /* if (beforeContainerDx <= minLeft) {
        dx = this.containerDx - minLeft
      }
      if (beforeContainerDx >= maxLeft) {
        dx = maxLeft - this.containerDx;
      } */
      this.changeResizePosition(dx, dy);
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
  // 计算parent坐标
  const _parentRect = this.options.parent.getBoundingClientRect();
  this.parentRect = {
    width: _parentRect.width,
    height: _parentRect.height,
    centerX: _parentRect.width / 2,
    centerY: _parentRect.height / 2,
  };
};

/**
 * 动态改变resize按钮的坐标
 * @param {*} dx
 * @param {*} dy
 * @param {*} isDrag 是否是在拖动容器导致的size变化
 */
Drag.prototype.changeResizePosition = function (dx, dy) {
  this.resizeDomPositon.left += dx;
  this.resizeDomPositon.top += dy;
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
    } else if (this.options.target === 'bottom') {
      this.dragTargetDom = this.contentDom;
    } else {
      this.dragTargetDom = this.container;
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
