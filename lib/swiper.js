class Swiper {
  #DEFAULT_SPEED = 3000;

  constructor(domId, config) {
    // console.log("config", domId, config);
    this.domId = domId;
    this.speed = config.speed ?? this.#DEFAULT_SPEED;
    this.defaultDuration = 300;

    // get some dom object
    this.swiper = document.getElementById(domId);
    this.swiperWrapper =
      this.swiper.getElementsByClassName("swiper-wrapper")[0];
    this.swiperContainer =
      this.swiperWrapper.getElementsByClassName("swiper-container")[0];
    this.swiperHrefs =
      this.swiperContainer.getElementsByClassName("swiper-href");
    this.swiperPageItems = this.swiper.getElementsByClassName(
      "swiper-pagination-item"
    );
    this.swiperButtonPrev =
      this.swiper.getElementsByClassName("swiper-button-prev")[0];
    this.swiperButtonNext =
      this.swiper.getElementsByClassName("swiper-button-next")[0];

    // current active swiper-slide' index, start from 0, end with swiperSlides.length - 1
    this.index = 0;
    const swiperSlides =
      this.swiperContainer.getElementsByClassName("swiper-slide");
    this.length = swiperSlides.length;

    // one swiper-slide width
    this.width = this.swiperWrapper.clientWidth;

    // record touchstart clientX and clientY
    this.startX = 0;
    this.startY = 0;
    this.startTimestamp = 0;

    // record touchmove clientX and clientY
    this.moveX = 0;
    this.moveY = 0;
    this.isLockTouchMove = true;
    this.isLockTouchEnd = true;

    // when rendering, we need translateX and duration for css3 style
    this.translateX = 0;
    this.duration = this.defaultDuration;

    this.timer = null;
    this.isLockTimer = false;
    this.startTimer();

    this.bindEvent();

    this.render();
  }

  startTimer() {
    this.timer = setInterval(() => {
      if (this.isLockTimer) {
        return;
      }
      this.slideToNext();
    }, this.speed);
  }

  closeTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  bindEvent() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      this.bindTouchEvent();
    } else {
      this.bindPointerEvent();
    }
    this.bindHrefClick();
    this.bindResize();
    this.bindPageClickEvent();
    this.bindNextPrevClickEvent();
  }

  bindPageClickEvent() {
    for (let i = 0; i < this.swiperPageItems.length; i++) {
      this.swiperPageItems[i].addEventListener(
        "click",
        () => {
          this.handlePageClick(i);
        },
        false
      );
    }
  }

  bindNextPrevClickEvent() {
    this.swiperButtonPrev.addEventListener(
      "click",
      () => {
        if (this.index === 0) {
          this.handlePageClick(this.length - 1);
        } else {
          this.handlePageClick(this.index - 1);
        }
      },
      false
    );

    this.swiperButtonNext.addEventListener(
      "click",
      () => {
        if (this.index === this.length - 1) {
          this.handlePageClick(0);
        } else {
          this.handlePageClick(this.index + 1);
        }
      },
      false
    );
  }

  handlePageClick(index) {
    this.index = index;
    this.closeTimer();
    this.slideTo(index);
    this.startTimer();
  }

  bindTouchEvent() {
    // console.log("bindTouchEvent");
    this.swiperContainer.addEventListener(
      "touchstart",
      this.handleTouchStart.bind(this),
      false
    );
    this.swiperContainer.addEventListener(
      "touchmove",
      this.handleTouchMove.bind(this),
      false
    );
    this.swiperContainer.addEventListener(
      "touchend",
      this.handleTouchEnd.bind(this),
      false
    );
  }

  bindPointerEvent() {
    // console.log("bindPointerEvent");
    // like touchstart
    this.swiperContainer.addEventListener(
      "pointerdown",
      this.handleTouchStart.bind(this),
      false
    );
    // like touchmove
    this.swiperContainer.addEventListener(
      "pointermove",
      this.handleTouchMove.bind(this),
      false
    );
    // like touchend
    this.swiperContainer.addEventListener(
      "pointerup",
      this.handleTouchEnd.bind(this),
      false
    );
    // action as touchend
    this.swiperContainer.addEventListener(
      "pointerleave",
      this.handleTouchEnd.bind(this),
      false
    );
  }

  bindHrefClick() {
    for (let i = 0; i < this.swiperHrefs.length; i++) {
      this.swiperHrefs[i].addEventListener(
        "click",
        this.handleHrefClick.bind(this),
        false
      );
    }
  }

  bindResize() {
    window.addEventListener("resize", this.handleResize.bind(this), false);
  }

  //   unbindEvent() {
  //     this.swiperContainer.removeEventListener(
  //       "touchstart",
  //       this.handleTouchStart.bind(this),
  //       false
  //     );
  //     this.swiperContainer.removeEventListener(
  //       "touchmove",
  //       this.handleTouchMove.bind(this),
  //       false
  //     );
  //     this.swiperContainer.removeEventListener(
  //       "touchend",
  //       this.handleTouchEnd.bind(this),
  //       false
  //     );
  //     this.swiperContainer.removeEventListener(
  //       "pointerdown",
  //       this.handleTouchStart.bind(this),
  //       false
  //     );
  //     this.swiperContainer.removeEventListener(
  //       "pointermove",
  //       this.handleTouchMove.bind(this),
  //       false
  //     );
  //     this.swiperContainer.removeEventListener(
  //       "pointerup",
  //       this.handleTouchEnd.bind(this),
  //       false
  //     );
  //     for (let i = 0; i < this.swiperHrefs.length; i++) {
  //       this.swiperHrefs[i].removeEventListener(
  //         "click",
  //         this.handleHrefClick.bind(this),
  //         false
  //       );
  //     }
  //     window.removeEventListener("resize", this.handleResize.bind(this), false);
  //   }

  handleHrefClick(event) {
    event.preventDefault();
  }

  handleTouchStart(event) {
    // console.log("handleTouchStart", event, this);
    const touch = event.type === "touchstart" ? event.touches[0] : event;
    const x = touch.clientX,
      y = touch.clientY;
    const timestamp = new Date().getTime();

    this.startX = x;
    this.startY = y;
    this.startTimestamp = timestamp;

    this.moveX = 0;
    this.moveY = 0;
    this.isLockTouchMove = false;
    this.isLockTouchEnd = false;

    this.isLockTimer = true;
    this.closeTimer();

    event.preventDefault();
  }

  handleTouchMove(event) {
    // console.log("touchmove", event, this);
    if (this.isLockTouchMove) {
      return;
    }
    const touch = event.type === "touchmove" ? event.touches[0] : event;
    const x = touch.clientX,
      y = touch.clientY;

    if (this.moveX !== 0) {
      const diffX = x - this.moveX;
      this.translateX += diffX;
      this.duration = 0;
      this.render();
    }

    this.moveX = x;
    this.moveY = y;
  }

  isSwipe(curX) {
    return Math.abs(curX - this.startX) > 30;
  }

  swipeDirection(curX, curY) {
    return Math.abs(curX - this.startX) >= Math.abs(curY - this.startY)
      ? curX - this.startX > 0
        ? "Left"
        : "Right"
      : curY - this.startY > 0
      ? "Up"
      : "Down";
  }

  handleTouchEnd(event) {
    // console.log("touchend", event, this);
    if (this.isLockTouchEnd) {
      return;
    }
    const touch = event.type === "touchend" ? event.changedTouches[0] : event;
    const x = touch.clientX,
      y = touch.clientY;
    const timestamp = new Date().getTime();

    if (this.isSwipe(x)) {
      const swipeDirection = this.swipeDirection(x, y);
      if (swipeDirection === "Left") {
        this.slideToLast();
      } else if (swipeDirection === "Right") {
        this.slideToNext();
      }
    } else {
      // is tap event?
      if (timestamp - this.startTimestamp <= 250) {
        // goto href
        window.location.href = this.swiperHrefs[this.index].href;
      } else {
        // recover original position
        this.slideTo(this.index);
      }
    }

    // init
    this.isLockTouchMove = true;
    this.isLockTouchEnd = true;

    this.isLockTimer = false;
    this.startTimer();
  }

  handleResize() {
    this.width = this.swiperWrapper.clientWidth;
    this.slideTo(this.index);
  }

  calTranslateX(index) {
    return -this.width * index;
  }

  slideTo(index) {
    this.translateX = this.calTranslateX(index);
    this.duration = this.defaultDuration;
    this.render();
  }

  slideToLast() {
    if (this.index == 0) {
      this.index = this.length - 1;
      this.duration = 0;
    } else {
      this.index--;
      this.duration = this.defaultDuration;
    }
    this.translateX = this.calTranslateX(this.index);
    this.render();
  }

  slideToNext() {
    if (this.index === this.length - 1) {
      this.index = 0;
      this.duration = 0;
    } else {
      this.index++;
      this.duration = this.defaultDuration;
    }
    this.translateX = this.calTranslateX(this.index);
    this.render();
  }

  render() {
    this.swiperContainer.style.transitionDuration = `${this.duration}ms`;
    this.swiperContainer.style.transform = `translate3d(${this.translateX}px, 0px, 0px)`;
    this.renderPagination(this.index);
  }

  renderPagination(activeIndex) {
    for (let i = 0; i < this.swiperPageItems.length; i++) {
      if (activeIndex !== i) {
        this.swiperPageItems[i].classList.remove(
          "swiper-pagination-item--active"
        );
      } else {
        this.swiperPageItems[i].classList.add("swiper-pagination-item--active");
      }
    }
  }

  //   destory() {
  //     this.unbindEvent();
  //     this.closeTimer();
  //   }
}
