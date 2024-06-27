import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {


  // language: string = '';
  // last_slide: boolean = false;

  // @ViewChild('swiper') swiper: SwiperComponent;

  // // Swiper config
  // config: SwiperOptions = {
  //   slidesPerView: 1,
  //   spaceBetween: 50,
  //   pagination: { clickable: false },
  //   allowTouchMove: false // set true to allow swiping
  // }

  // constructor(
  //   private router: Router,
  //   private ref: ChangeDetectorRef
  // ) { }
  // ngOnInit(): void {
  //   throw new Error('Method not implemented.');
  // }

  // ngAfterContentChecked(): void {

  //   if (this.swiper) {
  //     this.swiper.updateSwiper({});
  //   }
  // }

  // // Trigger swiper slide change
  // swiperSlideChanged(e) {
  //   // console.log(e);
  // }

  // // Go to next slide
  // nextSlide() {
  //   this.swiper.swiperRef.slideNext(500);
  // }

  // // Last slide trigger
  // onLastSlide() {
  //   this.last_slide = true;
  // }

  // // Go to main content
  // async getStarted() {

  //   // Navigate to /home
  //   this.router.navigateByUrl('/signin');
  // }

}

