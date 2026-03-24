import React, { useState, useEffect } from 'react';

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const banners = [
    '/banners/banner1.png',
    '/banners/banner2.png'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="hero-slider">
      {banners.map((src, index) => (
        <div
          key={index}
          className="slide"
          style={{
            backgroundImage: `url(${src})`,
            display: index === current ? 'flex' : 'none',
            opacity: index === current ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out'
          }}
        />
      ))}
    </div>
  );
};

export default HeroSlider;
