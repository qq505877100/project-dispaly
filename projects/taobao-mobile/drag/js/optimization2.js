/**
 * 这是优化过后的封装方式，可以适用很多种情况的内容滚动
  封装功能2：封装一个可滚动的容器（不限制任何内容，可以让用户自己填入）
  但是我们限制了用户必须按照我们的格式书写结构，在调用我们的方法，这样就可以让它
  变成一个可以双向滚动的容器。
 */
function scroll2(container) {
  // 滑块可以滚动的长度
  let operatorsDomScrollDistance = 0;
  let operatorsDomScrollLeft = 0;
  // 内容区可以滚动的长度
  let menusContenScrollDistance;
  let menusContentScrollLeft = 0;
  const menusClassName = '.menus';
  const menusContentClassName = '.menus-content';
  const menusOperatorsClassName = '.menus-operators-container';
  // 滑块的总长度
  const operatorsDomWidth = 60;

  createElement = function (tag, className) {
    const dom = document.createElement(tag);
    dom.className = className;
    return dom;
  };

  ininData = function () {
    // 容器宽度
    const containerWidth = container.getBoundingClientRect().width;
    // 菜单内容总宽度
    const contentWidth = container.querySelector(menusContentClassName).offsetWidth;
    menusContenScrollDistance = contentWidth - containerWidth;
    const percent = containerWidth / contentWidth;
    const width = Math.max(10, Math.floor(percent * operatorsDomWidth));
    const canScroll = menusContenScrollDistance > 0;
    if (canScroll) {
      operatorsDomScrollDistance = operatorsDomWidth - width;
      operatorItemDom.style.width = `${width}px`;
    } else {
      operatorsDom.style.display = 'none';
    }
  };

  init = function () {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    if (!container) {
      return new Error('传入的container容器不存在，初始化失败！');
    }
    menusDom = container.querySelector(menusClassName)
    generateDoms();
    bindEvents();
    ininData();
  };

  generateSlider = function () {
    const sliderContainerDom = container.querySelector(menusOperatorsClassName);
    operatorsDom = createElement('div', 'menus-operators');
    operatorItemDom = createElement('div', 'operator-item active');
    operatorsDom.appendChild(operatorItemDom);
    sliderContainerDom.appendChild(operatorsDom);
    container.appendChild(sliderContainerDom);
  };

  generateDoms = function () {
    // 创建滑块条
    generateSlider();
  };

  /**
   * value：本次要滚动的距离
   * isPercent: 两种模式，一种的百分比数值，一种是固定值
   * */
  menusDomScrollToLeftByOffset = function (value, isPercent) {
    let newScrollLeft = 0;
    if (isPercent) {
      value = Math.round(menusContenScrollDistance * value);
    }
    newScrollLeft = value + menusContentScrollLeft;
    if (0 <= newScrollLeft && newScrollLeft <= menusContenScrollDistance) {
      menusDom.scrollTo(newScrollLeft, 0);
      menusContentScrollLeft = newScrollLeft;
    }
  };

  operatorsDomScrollToLeftByOffset = function (value, isPercent) {
    if (isPercent) {
      value = operatorsDomScrollDistance * value;
    }
    const newScrollLeft = value + operatorsDomScrollLeft;
    if (
      0 <= newScrollLeft &&
      newScrollLeft <= operatorsDomScrollDistance
    ) {
      operatorItemDom.style.left = `${newScrollLeft}px`;
      operatorsDomScrollLeft = newScrollLeft;
    }
  };

  // 以菜单内容区的移动距离控制滚动
  scrollByMenusDomOffset = function (offset) {
    offset = -offset;
    const scrollPercent = offset / menusContenScrollDistance;
    menusDomScrollToLeftByOffset(offset);
    operatorsDomScrollToLeftByOffset(scrollPercent, true);
  };

  // 以滑块的移动距离控制滚动
  scrollByOperatorOffsetLeft = function (offset) {
    const scrollPercent = offset / operatorsDomScrollDistance;
    menusDomScrollToLeftByOffset(scrollPercent, true);
    operatorsDomScrollToLeftByOffset(offset);
  };

  _bindEvent = function (dom, scrollCallback) {
    let clientX;
    const touchstart = (e) => {
      e.preventDefault();
      clientX = e.changedTouches[0].clientX;
      dom.addEventListener('touchmove', touchmove);
      dom.addEventListener('touchend', touchend);
    };

    const touchmove = (e) => {
      e.preventDefault();
      const currentClientX = e.changedTouches[0].clientX;
      const offsetLeft = currentClientX - clientX;
      clientX = currentClientX;
      scrollCallback(offsetLeft);
    };

    const touchend = (e) => {
      e.preventDefault();
      dom.removeEventListener('touchend', touchend);
      dom.removeEventListener('touchmove', touchmove);
    };
    dom.addEventListener('touchstart', touchstart);
  };

  bindEvents = function () {
    // 1 绑定menus的鼠标事件
    _bindEvent(menusDom, scrollByMenusDomOffset.bind(this));
    // 2 绑定operator的鼠标事件
    _bindEvent(
      operatorsDom,
      scrollByOperatorOffsetLeft.bind(this)
    );
  };
  init();
}
