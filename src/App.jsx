import React, { useState, useEffect, useRef } from "react";
import useHasFinePointer from "./useHasFinePointer";

// It's common to define animations or custom styles that Tailwind can't generate
// directly in a style tag when working in a single file component like this.
const CustomStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter');

    .custom-cursor-active {
      cursor: none;
    }

    @keyframes fadeInSlideUp {
      0% {
        opacity: 0;
        transform: translateY(20px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-title-fade-in-slide-up {
      animation: fadeInSlideUp 1s ease-out 0.3s forwards;
    }
    .animate-fade-in-slide-up-1 {
      animation: fadeInSlideUp 1s ease-out 0.5s forwards;
    }
    .animate-fade-in-slide-up-2 {
      animation: fadeInSlideUp 1s ease-out 0.7s forwards;
    }
    .animate-fade-in-slide-up-3 {
      animation: fadeInSlideUp 1s ease-out 0.9s forwards;
    }
  `}</style>
);

// Main App Component
export default function App() {
  const hasFinePointer = useHasFinePointer();
  const [mousePosition, setMousePosition] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const [hasMouseMoved, setHasMouseMoved] = useState(false);
  const [isHoveringLink, setIsHoveringLink] = useState(false);
  const textRef = useRef(null);
  const [colors, setColors] = useState({
    glow: "rgba(20, 184, 166, 0.15)",
    text1: "#ccfbf1",
    text2: "#2dd4bf",
    text3: "#60a5fa",
  });

  // Effect for mouse tracking
  useEffect(() => {
    if (!hasFinePointer) return;

    const handleMouseMove = (event) => {
      if (!hasMouseMoved) {
        setHasMouseMoved(true);
      }
      setMousePosition({ x: event.clientX, y: event.clientY });

      if (textRef.current) {
        const rect = textRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        textRef.current.style.setProperty("--mouse-x", `${x}px`);
        textRef.current.style.setProperty("--mouse-y", `${y}px`);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [hasMouseMoved, hasFinePointer]);

  // Effect to handle link hovering for cursor state
  useEffect(() => {
    const links = document.querySelectorAll("a");
    const handleMouseEnter = () => setIsHoveringLink(true);
    const handleMouseLeave = () => setIsHoveringLink(false);

    links.forEach((link) => {
      link.addEventListener("mouseenter", handleMouseEnter);
      link.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      links.forEach((link) => {
        link.removeEventListener("mouseenter", handleMouseEnter);
        link.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, []);

  // Effect to toggle body class for custom cursor
  useEffect(() => {
    if (hasMouseMoved && hasFinePointer) {
      document.body.classList.add("custom-cursor-active");
    }
    // Cleanup function to remove the class when the component unmounts
    return () => {
      document.body.classList.remove("custom-cursor-active");
    };
  }, [hasMouseMoved, hasFinePointer]);

  // Effect for animating colors
  useEffect(() => {
    let animationFrameId;
    const animateColors = () => {
      const time = Date.now() / 8000; // Slower, more graceful transition
      const t = (-Math.sin(time) + 1) / 2; // Inverted sine wave to start on green

      // Define start (green/blue) and end (purple/pink) hues
      const startHues = { glow: 140, t1: 140, t2: 160, t3: 180 };
      const endHues = { glow: 290, t1: 290, t2: 320, t3: 300 };

      // Linear interpolation function
      const lerp = (a, b, alpha) => a + alpha * (b - a);

      // Interpolate the hue for each color component
      const currentHues = {
        glow: lerp(startHues.glow, endHues.glow, t),
        t1: lerp(startHues.t1, endHues.t1, t),
        t2: lerp(startHues.t2, endHues.t2, t),
        t3: lerp(startHues.t3, endHues.t3, t),
      };

      setColors({
        glow: `hsla(${currentHues.glow}, 70%, 50%, 0.15)`,
        text1: `hsl(${currentHues.t1}, 80%, 90%)`,
        text2: `hsl(${currentHues.t2}, 80%, 70%)`,
        text3: `hsl(${currentHues.t3}, 90%, 70%)`,
      });

      animationFrameId = requestAnimationFrame(animateColors);
    };

    animationFrameId = requestAnimationFrame(animateColors);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Calculate parallax offsets - only apply if mouse has moved
  const parallaxX = hasMouseMoved ? mousePosition.x - window.innerWidth / 2 : 0;
  const parallaxY = hasMouseMoved
    ? mousePosition.y - window.innerHeight / 2
    : 0;

  // Define transform styles for the parallax effect
  const mainTextTransform = {
    transform: `translate(${parallaxX / 50}px, ${parallaxY / 50}px)`,
  };
  const subTextTransform = {
    transform: `translate(${parallaxX / 25}px, ${parallaxY / 25}px)`,
  };

  const glowTransparency = hasFinePointer ? 80 : 60;

  return (
    <>
      <CustomStyles />
      <div
        className="bg-gray-950 min-h-screen flex items-center justify-center text-white overflow-hidden relative"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Custom Mouse Cursor */}
        {hasFinePointer && (
          <div
            className={`pointer-events-none fixed z-50 w-4 h-4 bg-white rounded-full shadow-[0_0_15px_5px_rgba(255,255,255,0.3)] transition-opacity duration-300 ease-out ${
              hasMouseMoved ? "opacity-100" : "opacity-0"
            }`}
            style={{
              left: `${mousePosition.x}px`,
              top: `${mousePosition.y}px`,
              transform: `translate(-50%, -50%) scale(${
                isHoveringLink ? 0 : 1
              })`,
              transition: "transform 0.2s ease-out, opacity 0.3s ease-out",
            }}
          ></div>
        )}
        {/* Mouse follower glow effect */}
        <div
          className="pointer-events-none fixed inset-0 z-20 transition-colors duration-1000 ease-linear"
          style={{
            background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, ${colors.glow}, transparent ${glowTransparency}%)`,
          }}
        ></div>{" "}
        {/* Main Content */}
        <div className="relative z-10 text-center p-4 mb-8">
          {/* Main Name with dynamic gradient and parallax effect */}
          <div className="opacity-0 animate-title-fade-in-slide-up">
            <h1
              ref={textRef}
              className="text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-medium tracking-tighter transition-transform duration-500 ease-out bg-clip-text text-transparent"
              style={{
                ...mainTextTransform,
                backgroundImage: `radial-gradient(circle 1000px at var(--mouse-x, 50%) var(--mouse-y, 50%), ${colors.text1} 0%, ${colors.text2} 50%, ${colors.text3} 100%)`,
              }}
            >
              calebeinolf
            </h1>
          </div>

          {/* Subtext Fields with parallax effect */}
          <div
            className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mt-8 transition-transform duration-500 ease-out"
            style={subTextTransform}
          >
            <a
              href="https://github.com/calebeinolf"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-300 rounded-full px-5 py-2 shadow-lg opacity-0 animate-fade-in-slide-up-3"
            >
              <div className="flex items-center justify-center gap-3 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 1024 1024"
                  fill="none"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
                    transform="scale(64)"
                    fill="#ffffff"
                  />
                </svg>
                GitHub
              </div>
            </a>
            <a
              href="https://www.linkedin.com/in/calebeinolf/"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-300 rounded-full px-5 py-2 shadow-lg opacity-0 animate-fade-in-slide-up-3"
            >
              <div className="flex items-center justify-center gap-3 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="19"
                  width="19"
                  viewBox="0 0 72 72"
                  fill="#fff"
                >
                  <path
                    fillRule="evenodd"
                    d="M8,72 L64,72 C68.418278,72 72,68.418278 72,64 L72,8 C72,3.581722 68.418278,-8.11624501e-16 64,0 L8,0 C3.581722,8.11624501e-16 -5.41083001e-16,3.581722 0,8 L0,64 C5.41083001e-16,68.418278 3.581722,72 8,72 Z M62,62 L51.315625,62 L51.315625,43.8021149 C51.315625,38.8127542 49.4197917,36.0245323 45.4707031,36.0245323 C41.1746094,36.0245323 38.9300781,38.9261103 38.9300781,43.8021149 L38.9300781,62 L28.6333333,62 L28.6333333,27.3333333 L38.9300781,27.3333333 L38.9300781,32.0029283 C38.9300781,32.0029283 42.0260417,26.2742151 49.3825521,26.2742151 C56.7356771,26.2742151 62,30.7644705 62,40.051212 L62,62 Z M16.349349,22.7940133 C12.8420573,22.7940133 10,19.9296567 10,16.3970067 C10,12.8643566 12.8420573,10 16.349349,10 C19.8566406,10 22.6970052,12.8643566 22.6970052,16.3970067 C22.6970052,19.9296567 19.8566406,22.7940133 16.349349,22.7940133 Z M11.0325521,62 L21.769401,62 L21.769401,27.3333333 L11.0325521,27.3333333 L11.0325521,62 Z"
                  />
                </svg>
                LinkedIn
              </div>
            </a>
            <a
              href="https://calebeinolf.com/design"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-300 rounded-full px-5 py-2 shadow-lg opacity-0 animate-fade-in-slide-up-3"
            >
              <div className="flex items-center justify-center gap-3 opacity-70 group-hover:opacity-100 transition-all duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="19"
                  viewBox="0 0 116 53"
                  fill="none"
                >
                  <path
                    d="M57.9998 1.95056C44.7142 1.95056 33.9426 12.722 33.9426 26.0075C33.9426 39.2931 44.7142 50.0645 57.9998 50.0645C71.2854 50.0645 82.057 39.2931 82.057 26.0075C82.057 12.722 71.2854 1.95056 57.9998 1.95056ZM66.4198 26.0075C61.7709 26.0075 57.9998 22.2364 57.9998 17.5876C57.9998 12.9387 61.7709 9.16766 66.4198 9.16766C71.0687 9.16766 74.8398 12.9387 74.8398 17.5876C74.8398 22.2364 71.0687 26.0075 66.4198 26.0075Z"
                    fill="#fff"
                  />
                  <path
                    d="M4.75996 37.5014L19.2737 52.0151H35.8934L9.88565 26.0075L35.8934 0H19.2737L4.75996 14.5137C-1.58665 20.8602 -1.58665 31.1549 4.75996 37.5014Z"
                    fill="#fff"
                  />
                  <path
                    d="M111.24 37.5014L96.7264 52.0151H80.1067L106.114 26.0075L80.1067 0H96.7264L111.24 14.5137C117.587 20.8602 117.587 31.1549 111.24 37.5014Z"
                    fill="#fff"
                  />
                </svg>
                Portfolio
              </div>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
