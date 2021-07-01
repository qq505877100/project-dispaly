function Scroll(container, imgList) {
  this.container = container;
  this.imgList = imgList;
  // 每列的宽度
  this.itemWidth = 73;
  // 滑块可以滚动的长度
  this.operatorsDomScrollDistance = 60 - 20;
  this.operatorsDomScrollLeft = 0;
  // 内容区可以滚动的长度
  this.menusContenScrollDistance;
  this.menusContentScrollLeft = 0;

  this.createElement = function (tag, className) {
    const dom = document.createElement(tag);
    dom.className = className;
    return dom;
  };

  this.changeData = function () {
    this._imgList = [];
    this.imgList.reduce((prev, curr) => {
      prev.push(curr);
      if (prev.length === 2) {
        this._imgList.push(prev);
        prev = [];
      }
      return prev;
    }, []);
  };

  this.init = function () {
    if (typeof this.container === 'string') {
      this.container = document.querySelector(container);
    }
    if (!this.container) {
      return new Error('传入的container容器不存在，初始化失败！');
    }
    if (!this.imgList) {
      return new Error('imgList属性为空，初始化失败！');
    }
    // 容器宽度
    const containerWidth = this.container.getBoundingClientRect().width;
    // 菜单内容总宽度
    const contentWidth = Math.ceil(imgList.length / 2) * this.itemWidth;
    this.menusContenScrollDistance = contentWidth - containerWidth;
    this.changeData();
    this.generateDoms();
    this.bindEvents();
  };

  this.createItemDom = function (imgs) {
    const creatItem = (data) => {
      const itemDom = this.createElement('div', 'item');
      const imgDom = document.createElement('img');
      const spanDom = this.createElement('span', 'text');

      imgDom.src = data.url;
      spanDom.innerText = data.text;
      itemDom.appendChild(imgDom);
      itemDom.appendChild(spanDom);
      return itemDom;
    };
    const menuItem = this.createElement('div', 'menu-item');
    const [itemTop, itemBottom] = imgs;
    menuItem.appendChild(creatItem(itemTop));
    menuItem.appendChild(creatItem(itemBottom));
    return menuItem;
  };

  this.generateMenus = function () {
    this.menusDom = this.createElement('div', 'menus');
    const menusContentDom = this.createElement('div', 'menus-content');
    // 遍历图片数据，生成dom元素
    this._imgList.forEach((imgs) => {
      const itemDom = this.createItemDom(imgs);
      menusContentDom.appendChild(itemDom);
    });
    this.menusDom.appendChild(menusContentDom);
    this.container.appendChild(this.menusDom);
  };

  this.generateSlider = function () {
    const sliderContainerDom = this.createElement(
      'div',
      'menus-operators-container'
    );
    this.operatorsDom = this.createElement('div', 'menus-operators');
    this.operatorItemDom = this.createElement('div', 'operator-item active');
    this.operatorsDom.appendChild(this.operatorItemDom);
    sliderContainerDom.appendChild(this.operatorsDom);
    this.container.appendChild(sliderContainerDom);
  };

  this.generateDoms = function () {
    // 1 创建menus
    this.generateMenus();
    // 2 创建滑块条
    this.generateSlider();
  };

  /**
   * value：本次要滚动的距离
   * isPercent: 两种模式，一种的百分比数值，一种是固定值
   * */
  this.menusDomScrollToLeftByOffset = function (value, isPercent) {
    let newScrollLeft = 0;
    if (isPercent) {
      value = Math.round(this.menusContenScrollDistance * value);
    }
    newScrollLeft = value + this.menusContentScrollLeft;
    if (0 <= newScrollLeft && newScrollLeft <= this.menusContenScrollDistance) {
      this.menusDom.scrollTo(newScrollLeft, 0);
      this.menusContentScrollLeft = newScrollLeft;
    }
  };

  this.operatorsDomScrollToLeftByOffset = function (value, isPercent) {
    if (isPercent) {
      value = this.operatorsDomScrollDistance * value;
    }
    const newScrollLeft = value + this.operatorsDomScrollLeft;
    if (
      0 <= newScrollLeft &&
      newScrollLeft <= this.operatorsDomScrollDistance
    ) {
      this.operatorItemDom.style.left = `${newScrollLeft}px`;
      this.operatorsDomScrollLeft = newScrollLeft;
    }
  };

  // 以菜单内容区的移动距离控制滚动
  this.scrollByMenusDomOffset = function (offset) {
    offset = -offset;
    const scrollPercent = offset / this.menusContenScrollDistance;
    this.menusDomScrollToLeftByOffset(offset);
    this.operatorsDomScrollToLeftByOffset(scrollPercent, true);
  };

  // 以滑块的移动距离控制滚动
  this.scrollByOperatorOffsetLeft = function (offset) {
    const scrollPercent = offset / this.operatorsDomScrollDistance;
    this.menusDomScrollToLeftByOffset(scrollPercent, true);
    this.operatorsDomScrollToLeftByOffset(offset);
  };
  
  this._bindEvent = function (dom, scrollCallback) {
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

  this.bindEvents = function () {
    // 1 绑定menus的鼠标事件
    this._bindEvent(this.menusDom, this.scrollByMenusDomOffset.bind(this));
    // 2 绑定operator的鼠标事件
    this._bindEvent(
      this.operatorsDom,
      this.scrollByOperatorOffsetLeft.bind(this)
    );
  };
  this.init();
}
