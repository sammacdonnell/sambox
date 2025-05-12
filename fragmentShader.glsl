uniform float time;
uniform float coherence;
uniform float kappa;
varying vec3 vNormal;

// Simple noise function (replaceAscent
float noise(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
}

void main() {
    vec3 color = mix(vec3(0.1, 0.5, 1.0), vec3(1.0, 0.2, 0.2), 1.0 - coherence); // Blue to red
    float n = noise(vNormal * 3.0 + time * 0.2) * kappa; // Noise driven by kappa
    float intensity = coherence * (1.0 + 0.3 * sin(time * 2.0 + n)); // Pulsate
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0, 0, 1))), 2.0); // Glow
    gl_FragColor = vec4(color * intensity + vec3(0.5) * fresnel, 1.0);
}
