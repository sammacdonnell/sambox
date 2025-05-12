uniform float time;
uniform float coherence;
uniform float kappa;
varying vec3 vNormal;

// 2D Random
vec2 random2(vec2 st) {
    st = vec2(dot(st, vec2(127.1, 311.7)), dot(st, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(st) * 43758.5453123);
}

// 2D Perlin Noise
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(dot(random2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                   dot(random2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
               mix(dot(random2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                   dot(random2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    vec2 uv = vNormal.xy * 3.0 + time * 0.2;
    float n = fbm(uv) * kappa; // Use fBm for smoother noise
    vec3 color = mix(vec3(0.1, 0.5, 1.0), vec3(1.0, 0.2, 0.2), 1.0 - coherence);
    float intensity = coherence * (1.0 + 0.7 * sin(time * 2.0 + n * 5.0)); // Amplify noise effect
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0, 0, 1))), 3.0); // Stronger glow
    gl_FragColor = vec4(color * intensity + vec3(1.0) * fresnel, 1.0);
}
