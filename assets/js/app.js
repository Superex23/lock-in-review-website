(function initStickyReviewTemplate() {
  const stickyReview = document.querySelector("[data-sticky-review]");
  if (!stickyReview) {
    return;
  }

  const copySections = Array.from(document.querySelectorAll("[data-review-copy]"));
  const mediaSections = Array.from(document.querySelectorAll("[data-review-media]"));
  if (copySections.length === 0 || copySections.length !== mediaSections.length) {
    return;
  }

  const hasGsap = typeof window.gsap !== "undefined";
  const hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";
  const canUseScroll = hasGsap && hasScrollTrigger && window.innerWidth > 900;
  const tocButtons = Array.from(document.querySelectorAll("[data-go-to-section]"));
  const backButtons = Array.from(document.querySelectorAll("[data-back-overview]"));
  const sectionCount = copySections.length;

  const setActive = (nextIndex) => {
    copySections.forEach((item, index) => {
      item.classList.toggle("is-active", index === nextIndex);
    });
    mediaSections.forEach((item, index) => {
      item.classList.toggle("is-active", index === nextIndex);

      const video = item.querySelector("video");
      if (!video) {
        return;
      }

      if (index === nextIndex) {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
      } else {
        video.pause();
      }
    });
  };

  setActive(0);

  let scrollTriggerInstance = null;

  const goToSection = (targetIndex) => {
    const nextIndex = Math.max(0, Math.min(sectionCount - 1, targetIndex));
    setActive(nextIndex);

    if (canUseScroll && scrollTriggerInstance) {
      const denominator = Math.max(sectionCount - 1, 1);
      const targetProgress = nextIndex / denominator;
      const targetY =
        scrollTriggerInstance.start +
        (scrollTriggerInstance.end - scrollTriggerInstance.start) * targetProgress;

      window.scrollTo({ top: targetY, behavior: "smooth" });
      return;
    }

    const targetSection = copySections[nextIndex];
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  tocButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = Number(button.getAttribute("data-go-to-section"));
      if (Number.isNaN(target)) {
        return;
      }
      goToSection(target);
    });
  });

  backButtons.forEach((button) => {
    button.addEventListener("click", () => {
      goToSection(0);
    });
  });

  if (!canUseScroll) {
    return;
  }

  window.gsap.registerPlugin(window.ScrollTrigger);

  let activeIndex = 0;

  scrollTriggerInstance = window.ScrollTrigger.create({
    trigger: stickyReview,
    start: "top top+=90",
    end: "bottom bottom",
    scrub: true,
    onUpdate: (self) => {
      const nextIndex = Math.min(
        sectionCount - 1,
        Math.floor(self.progress * sectionCount)
      );

      if (nextIndex !== activeIndex) {
        activeIndex = nextIndex;
        setActive(activeIndex);
      }
    },
  });
})();