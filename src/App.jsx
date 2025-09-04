import React, { useState, useEffect, useRef } from "react";

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
  const [mousePosition, setMousePosition] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const [hasMouseMoved, setHasMouseMoved] = useState(false);
  const textRef = useRef(null);
  const [colors, setColors] = useState({
    glow: "rgba(20, 184, 166, 0.15)",
    text1: "#ccfbf1",
    text2: "#2dd4bf",
    text3: "#60a5fa",
  });

  // Effect for mouse tracking
  useEffect(() => {
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
  }, [hasMouseMoved]);

  // Effect to toggle body class for custom cursor
  useEffect(() => {
    if (hasMouseMoved) {
      document.body.classList.add("custom-cursor-active");
    }
    // Cleanup function to remove the class when the component unmounts
    return () => {
      document.body.classList.remove("custom-cursor-active");
    };
  }, [hasMouseMoved]);

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

  return (
    <>
      <CustomStyles />
      <div
        className="bg-slate-900 min-h-screen flex items-center justify-center text-white overflow-hidden relative"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Custom Mouse Cursor */}
        <div
          className={`pointer-events-none fixed z-50 w-4 h-4 bg-white rounded-full shadow-[0_0_15px_5px_rgba(255,255,255,0.3)] transition-opacity duration-300 ease-out ${
            hasMouseMoved ? "opacity-100" : "opacity-0"
          }`}
          style={{
            left: `${mousePosition.x}px`,
            top: `${mousePosition.y}px`,
            transform: "translate(-50%, -50%)",
          }}
        ></div>

        {/* Mouse follower glow effect */}
        <div
          className="pointer-events-none fixed inset-0 z-20 transition-colors duration-1000 ease-linear"
          style={{
            background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, ${colors.glow}, transparent 80%)`,
          }}
        ></div>

        <div className="relative z-10 text-center p-4">
          {/* Main Name with dynamic gradient and parallax effect */}
          <div className="opacity-0 animate-title-fade-in-slide-up">
            <h1
              ref={textRef}
              className="text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-semibold tracking-tighter transition-transform duration-500 ease-out bg-clip-text text-transparent"
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
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 shadow-lg opacity-0 animate-fade-in-slide-up-1">
              <p className="text-slate-300 text-sm md:text-base tracking-wider">
                ui/ux design
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 shadow-lg opacity-0 animate-fade-in-slide-up-2">
              <p className="text-slate-300 text-sm md:text-base tracking-wider">
                web development
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 shadow-lg opacity-0 animate-fade-in-slide-up-3">
              <p className="text-slate-300 text-sm md:text-base tracking-wider">
                programming
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
