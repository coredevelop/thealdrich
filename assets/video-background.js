import { i as isInView, a as isOutOfView } from "vendors/index.es";
class VideoBackground extends HTMLElement {
  constructor() {
    super();
    this.video = this.querySelector("video");
    const options = {
      threshold: 1e-3
    };
    isInView(this, () => {
      this.video.play();
    }, options);
    isOutOfView(this, () => {
      this.video.pause();
    }, options);
  }
}
customElements.define("video-background", VideoBackground);
