import { i as isInView, a as isOutOfView } from "vendors/index.es";
import { l } from "vendors/index.esm";
import { v as vidim } from "vendors/vidim";
class VideoBackgroundObject extends HTMLElement {
  constructor() {
    super();
    this.mediaId = this.dataset.mediaId;
    this.mobileAutoplay = JSON.parse(this.dataset.mobileAutoplay);
    this.loaded = JSON.parse(this.dataset.loaded);
    if (!this.mediaId) return;
    this.loadYouTubeAPI();
  }
  loadYouTubeAPI() {
    if (window.YT !== void 0) {
      theme.youTubeApiStatus = "ready";
    }
    if (theme.youTubeApiStatus !== "loaded" || theme.youTubeApiStatus !== "ready") {
      const script = document.createElement("script");
      script.id = `youtube-iframe-api`;
      script.src = `https://www.youtube.com/iframe_api`;
      script.async = true;
      script.onload = async () => {
        await l(() => window.YT.Player !== void 0, {
          timeout: 1e4
        });
        theme.youTubeApiStatus = "loaded";
        this.initBackgroundVideo();
      };
      document.body.append(script);
    } else if (theme.youTubeApiStatus === "ready") {
      this.initBackgroundVideo();
    } else {
      window.onYouTubeIframeAPIReady = () => {
        this.initBackgroundVideo();
      };
    }
  }
  async initBackgroundVideo() {
    const container = document.createElement("div");
    container.classList.add(
      "video-background__container",
      "absolute",
      "inset-0",
      "z-10"
    );
    this.appendChild(container);
    const videoBackgroundContainer = this.querySelector(
      ".video-background__container"
    );
    await l(() => theme.youTubeApiStatus === "loaded", { timeout: 1e4 });
    const videoBackground = new vidim(videoBackgroundContainer, {
      type: "YouTube",
      src: this.mediaId
    });
    videoBackground.once("ready", function() {
      this.container.style.opacity = 0;
      videoBackground.play();
      inViewEvents();
    });
    function inViewEvents() {
      const options = {
        threshold: 1e-3
      };
      isInView(container, (target) => {
        videoBackground.play();
      }, options);
      isOutOfView(container, (target) => {
        videoBackground.pause();
      }, options);
    }
    videoBackground.on("play", function() {
      const container2 = this.container;
      const showDelay = 200;
      window.setTimeout(function() {
        container2.style.opacity = 1;
      }, showDelay);
    });
  }
}
customElements.define("video-background-object", VideoBackgroundObject);
