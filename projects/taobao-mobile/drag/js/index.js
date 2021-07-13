// 第一版代码，直接面向过程编程
const init = () => {
  // 1 获取dom元素
  const menusDom = document.querySelector('.menus');
  const menusContentDom = document.querySelector('.menus-content');
  const operatorsDom = document.querySelector('.menus-operators');
  const operatorItemDom = document.querySelector('.operator-item');
  // 2 计算容器的宽度和可滚动距离
  const menusDomWidth = menusDom.getBoundingClientRect().width;
  const menusContentDomWidth = menusContentDom.getBoundingClientRect().width;
  const menusContenScrollDistance = menusContentDomWidth - menusDomWidth;
  // 滚动初始值
  let menusContentScrollLeft = 0;

  const operatorsDomWidth = operatorsDom.getBoundingClientRect().width;
  const operatorItemDomWidth = operatorItemDom.getBoundingClientRect().width;
  const operatorsDomScrollDistance = operatorsDomWidth - operatorItemDomWidth;
  let operatorsDomScrollLeft = 0;

  /**
   * value：本次要滚动的距离
   * isPercent: 两种模式，一种的百分比数值，一种是固定值
   * */
  const menusDomScrollToLeftByOffset = (value, isPercent) => {
    let newScrollLeft = 0;
    if (isPercent) {
      value = menusContenScrollDistance * value;
    }
    newScrollLeft = value + menusContentScrollLeft;
    if (0 <= newScrollLeft && newScrollLeft <= menusContenScrollDistance) {
      menusDom.scrollTo(newScrollLeft, 0);
      menusContentScrollLeft = newScrollLeft;
    }
  };

  const operatorsDomScrollToLeftByOffset = (value, isPercent) => {
    if (isPercent) {
      value = operatorsDomScrollDistance * value;
    }
    const newScrollLeft = value + operatorsDomScrollLeft;
    if (0 <= newScrollLeft && newScrollLeft <= operatorsDomScrollDistance) {
      operatorItemDom.style.left = `${newScrollLeft}px`;
      operatorsDomScrollLeft = newScrollLeft;
    }
  };

  // 以菜单内容区的移动距离控制滚动
  const scrollByMenusDomOffset = (offset) => {
    offset = -offset;
    const scrollPercent = offset / menusContenScrollDistance;
    menusDomScrollToLeftByOffset(offset);
    operatorsDomScrollToLeftByOffset(scrollPercent, true);
  };

  // 以滑块的移动距离控制滚动
  const scrollByOperatorOffsetLeft = (offset) => {
    const scrollPercent = offset / operatorsDomScrollDistance;
    menusDomScrollToLeftByOffset(scrollPercent, true);
    operatorsDomScrollToLeftByOffset(offset);
  };

  const bindEvent = (dom, scrollCallback) => {
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
      console.log('touchend');
      dom.removeEventListener('touchend', touchend);
      dom.removeEventListener('touchmove', touchmove);
    };
    dom.addEventListener('touchstart', touchstart);
  };
  // 2 绑定事件
  const bindEvents = () => {
    // 1 绑定menus的鼠标事件
    bindEvent(menusDom, scrollByMenusDomOffset);
    // 2 绑定operator的鼠标事件
    bindEvent(operatorsDom, scrollByOperatorOffsetLeft);
  };
  bindEvents();
};
window.onload = () => init();
