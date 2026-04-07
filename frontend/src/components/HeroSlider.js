import React, { useState, useEffect, useCallback } from 'react';

const BANNERS = [
  {
    src: '/banners/banner1.png',
    title: 'Phim Đang Hot',
    subtitle: 'Đặt vé ngay hôm nay',
  },
  {
    src: '/banners/banner2.png',
    title: 'Ưu Đãi Đặc Biệt',
    subtitle: 'Combo tiết kiệm cho thành viên',
  },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback((index) => {
    if (animating) return;
    setAnimating(true);
    setCurrent(index);
    setTimeout(() => setAnimating(false), 700);
  }, [animating]);

  const prev = useCallback(() => {
    goTo((current - 1 + BANNERS.length) % BANNERS.length);
  }, [current, goTo]);

  const next = useCallback(() => {
    goTo((current + 1) % BANNERS.length);
  }, [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="hero-slider-v2">
      {/* Slides */}
      <div className="slider-track">
        {BANNERS.map((banner, index) => (
          <div
            key={index}
            className={`slide-v2 ${index === current ? 'active' : ''}`}
            style={{ backgroundImage: `url(${banner.src})` }}
          />
        ))}
      </div>

      {/* Overlay gradient */}
      <div className="slider-overlay" />

      {/* Arrow Buttons */}
      <button className="slider-arrow slider-arrow-prev" onClick={prev} aria-label="Previous">
        &#8249;
      </button>
      <button className="slider-arrow slider-arrow-next" onClick={next} aria-label="Next">
        &#8250;
      </button>

      {/* Dot Indicators */}
      <div className="slider-dots">
        {BANNERS.map((_, index) => (
          <button
            key={index}
            className={`slider-dot ${index === current ? 'active' : ''}`}
            onClick={() => goTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
