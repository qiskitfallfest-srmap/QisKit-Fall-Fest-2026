"use client";

import React, { useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';

interface InteractiveContourLinesProps {
  className?: string;
  style?: React.CSSProperties;
}

const VERTEX_SHADER = `#version 300 es
precision highp float;
in vec2 position;
out vec2 vUv;
void main() {
  vUv = (position + 1.0) * 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uTime;
uniform float uClickTime;
uniform vec2 uClickPos;
uniform bool uIsDark;

// Simplex-style 2D noise functions
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
        + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float aspect = uResolution.x / uResolution.y;
  vec2 p = uv;
  p.x *= aspect;

  vec2 pointer = uPointer;
  pointer.x *= aspect;

  // Pointer distortion well (bending lines around cursor)
  float distToPointer = distance(p, pointer);
  float pointerInfluence = smoothstep(0.45, 0.0, distToPointer);
  vec2 bend = normalize(p - pointer + vec2(0.0001)) * pointerInfluence * 0.12;

  // Click shockwave pulse
  float clickAge = uTime - uClickTime;
  float clickWave = 0.0;
  if (clickAge > 0.0 && clickAge < 2.5) {
    vec2 clickP = uClickPos;
    clickP.x *= aspect;
    float distToClick = distance(p, clickP);
    float waveRadius = clickAge * 0.75;
    float waveDist = abs(distToClick - waveRadius);
    clickWave = smoothstep(0.08, 0.0, waveDist) * exp(-clickAge * 1.5) * 0.25;
  }

  vec2 samplePos = (p + bend) * 2.2;
  float t = uTime * 0.08;

  // Multi-octave potential field
  float n1 = snoise(samplePos + vec2(t * 0.4, t * 0.3));
  float n2 = snoise(samplePos * 2.1 - vec2(t * 0.3, t * 0.5)) * 0.5;
  float n3 = snoise(samplePos * 4.0 + vec2(t * 0.2, -t * 0.2)) * 0.25;
  float height = (n1 + n2 + n3) + clickWave + pointerInfluence * 0.35;

  // Generate sharp, anti-aliased contour isolines
  float stepInterval = 0.14;
  float lineCoord = height / stepInterval;
  float lineFrac = fract(lineCoord);
  float lineDist = abs(lineFrac - 0.5);
  float filterWidth = fwidth(lineCoord);
  float lineIntensity = 1.0 - smoothstep(0.0, filterWidth * 1.6, lineDist);

  // Subtle major index lines every 4th contour
  float majorLine = 1.0 - smoothstep(0.0, filterWidth * 2.4, abs(fract(lineCoord * 0.25) - 0.5));

  // Theme palettes:
  // Light: Warm Ivory base (#F8F4EF), Rich Burgundy isolines (#6C151E), Champagne Gold accents (#B08D57)
  // Dark: Deep Obsidian base (#100405), Crimson Glow lines (#E45464), Radiant Gold accents (#B08D57)
  vec3 bgLight = vec3(0.973, 0.957, 0.937);       // #F8F4EF
  vec3 lineLightBurgundy = vec3(0.424, 0.082, 0.118); // #6C151E
  vec3 lineLightGold = vec3(0.690, 0.553, 0.341);     // #B08D57

  vec3 bgDark = vec3(0.063, 0.016, 0.024);        // #100405
  vec3 lineDarkCrimson = vec3(0.894, 0.329, 0.392);   // #E45464
  vec3 lineDarkGold = vec3(0.690, 0.553, 0.341);      // #B08D57

  vec3 bgColor = uIsDark ? bgDark : bgLight;
  vec3 primaryLine = uIsDark ? lineDarkCrimson : lineLightBurgundy;
  vec3 accentLine = uIsDark ? lineDarkGold : lineLightGold;

  // Blend contour colors across height
  vec3 lineColor = mix(primaryLine, accentLine, smoothstep(-0.3, 0.5, height));

  // Pointer proximity glow
  float glow = pointerInfluence * (uIsDark ? 0.35 : 0.2);

  float alpha = lineIntensity * (uIsDark ? 0.75 : 0.65) + majorLine * 0.2 + glow * 0.3;
  vec3 finalColor = mix(bgColor, lineColor, clamp(alpha, 0.0, 1.0));

  fragColor = vec4(finalColor, 1.0);
}
`;

export function InteractiveContourLines({ className = '', style }: InteractiveContourLinesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', { alpha: false, antialias: true, powerPreference: 'high-performance' });
    if (!gl) return;

    // Compile shader helper
    const createShader = (type: number, src: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragShader = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Full-screen quad
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uResolution = gl.getUniformLocation(program, 'uResolution');
    const uPointer = gl.getUniformLocation(program, 'uPointer');
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uClickTime = gl.getUniformLocation(program, 'uClickTime');
    const uClickPos = gl.getUniformLocation(program, 'uClickPos');
    const uIsDark = gl.getUniformLocation(program, 'uIsDark');

    let animId: number;
    let startTime = performance.now();
    let pointer = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };
    let clickTime = -100.0;
    let clickPos = { x: 0.5, y: 0.5 };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.targetX = (e.clientX - rect.left) / rect.width;
      pointer.targetY = 1.0 - (e.clientY - rect.top) / rect.height; // invert Y for WebGL
    };

    const handlePointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      clickPos.x = (e.clientX - rect.left) / rect.width;
      clickPos.y = 1.0 - (e.clientY - rect.top) / rect.height;
      clickTime = (performance.now() - startTime) / 1000;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerdown', handlePointerDown);

    const render = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = canvas.getBoundingClientRect();
      const w = Math.floor(rect.width * dpr);
      const h = Math.floor(rect.height * dpr);

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }

      // Smooth pointer interpolation
      pointer.x += (pointer.targetX - pointer.x) * 0.08;
      pointer.y += (pointer.targetY - pointer.y) * 0.08;

      const currentTime = (performance.now() - startTime) / 1000;
      const isDark = (resolvedTheme || theme) === 'dark';

      gl.useProgram(program);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform2f(uPointer, pointer.x, pointer.y);
      gl.uniform1f(uTime, currentTime);
      gl.uniform1f(uClickTime, clickTime);
      gl.uniform2f(uClickPos, clickPos.x, clickPos.y);
      gl.uniform1i(uIsDark, isDark ? 1 : 0);

      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      gl.deleteBuffer(vbo);
      gl.deleteVertexArray(vao);
    };
  }, [theme, resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-auto ${className}`}
      style={style}
    />
  );
}

export default InteractiveContourLines;
