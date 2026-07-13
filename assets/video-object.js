import { a as isOutOfView } from "vendors/index.es";
class VideoObject extends HTMLElement {
  constructor() {
    super();
    this.mediaId = this.dataset.mediaId;
    if (!this.mediaId) return;
    this.mediaType = this.dataset.mediaType;
    this.loaded = JSON.parse(this.dataset.loaded);
    this.bindEvents();
  }
  bindEvents() {
    this.coverButton = this.querySelector(".video__cover-button");
    this.coverButton.addEventListener("click", (event) => {
      this.pauseAllMedia();
      if (!this.loaded) {
        const content = document.createElement("div");
        content.appendChild(
          this.querySelector("template").content.firstElementChild.cloneNode(
            true
          )
        );
        this.loaded = true;
        this.dataset.loaded = true;
        this.appendChild(
          content.querySelector("video, model-viewer, iframe")
        ).focus();
        this.video = this.querySelector("video, model-viewer, iframe");
      }
      switch (this.mediaType) {
        case "youtube":
          this.loadYouTubeAPI();
          break;
        case "vimeo":
          this.loadVimeoAPI();
          break;
        case "video":
          this.video.play();
          break;
      }
      isOutOfView(this, (target) => {
        this.pauseMedia();
      });
      event.preventDefault();
    });
  }
  loadVimeoAPI() {
    const script = document.createElement("script");
    script.src = "https://player.vimeo.com/api/player.js";
    script.async = true;
    script.onload = () => {
      const iframe = this.querySelector("iframe");
      this.player = new Vimeo.Player(iframe);
      this.player.play().catch((error) => {
        console.error("Error playing the video:", error);
      });
      isOutOfView(this, (target) => {
        this.player.pause().catch((error) => {
          console.error("Error pausing the video:", error);
        });
      });
    };
    document.body.appendChild(script);
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
      script.onload = () => {
        theme.youTubeApiStatus = "loaded";
      };
      document.body.append(script);
    }
    if (theme.youTubeApiStatus === "ready") {
      this.player = new YT.Player(this.video.id, {
        events: {
          onReady: () => this.onPlayerReady()
        }
      });
    } else {
      window.onYouTubeIframeAPIReady = () => {
        this.player = new YT.Player(this.video.id, {
          events: {
            onReady: () => {
              this.onPlayerReady();
              theme.youTubeApiStatus = "ready";
            }
          }
        });
      };
    }
  }
  onPlayerReady(player) {
    this.player.playVideo();
    isOutOfView(this, (target) => {
      this.player.pauseVideo();
    });
  }
  pauseMedia() {
    this.querySelectorAll(".js-youtube").forEach((video) => {
      video.contentWindow.postMessage(
        '{"event":"command","func":"pauseVideo","args":""}',
        "*"
      );
    });
    this.querySelectorAll(".js-vimeo").forEach((video) => {
      video.contentWindow.postMessage('{"method":"pause"}', "*");
    });
    this.querySelectorAll("video").forEach((video) => video.pause());
    this.querySelectorAll("product-model").forEach((model) => {
      if (model.modelViewerUI) model.modelViewerUI.pause();
    });
  }
  pauseAllMedia() {
    document.querySelectorAll(".js-youtube").forEach((video) => {
      video.contentWindow.postMessage(
        '{"event":"command","func":"pauseVideo","args":""}',
        "*"
      );
    });
    document.querySelectorAll(".js-vimeo").forEach((video) => {
      video.contentWindow.postMessage('{"method":"pause"}', "*");
    });
    document.querySelectorAll("video").forEach((video) => video.pause());
    document.querySelectorAll("product-model").forEach((model) => {
      if (model.modelViewerUI) model.modelViewerUI.pause();
    });
  }
}
customElements.define("video-object", VideoObject);
