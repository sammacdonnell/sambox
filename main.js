 // Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// Load shaders
async function loadShaders() {
    const vertexShader = await fetch('vertexShader.glsl').then(res => res.text());
    const fragmentShader = await fetch('fragmentShader.glsl').then(res => res.text());
    return { vertexShader, fragmentShader };
}

// Bloch sphere
loadShaders().then(({ vertexShader, fragmentShader }) => {
    const uniforms = {
        time: { value: 0.0 },
        coherence: { value: 0.5 },
        kappa: { value: 0.1 }
    };

    const material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    });

    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Physics parameters
    let kappa = 0.1;
    let gamma = 0.05;
    let coherence = 0.5;

    // Update physics
    function updatePhysics(dt) {
        const noise = Math.sqrt(kappa * dt) * (Math.random() - 0.5);
        coherence *= Math.exp(-gamma * dt);
        coherence += noise * 0.1;
        coherence = Math.max(0, Math.min(coherence, 0.5));
        uniforms.coherence.value = coherence;
    }

    // Animation loop
    let time = 0;
    let lastTime = performance.now() / 1000;
    function animate() {
        requestAnimationFrame(animate);
        const currentTime = performance.now() / 1000;
        const dt = currentTime - lastTime;
        lastTime = currentTime;

        time += dt;
        uniforms.time.value = time;
        updatePhysics(dt);
        renderer.render(scene, camera);
    }
    animate();

    // Parameter updates
    document.getElementById('kappa').addEventListener('input', (e) => {
        kappa = parseFloat(e.target.value);
        uniforms.kappa.value = kappa;
    });
    document.getElementById('gamma').addEventListener('input', (e) => {
        gamma = parseFloat(e.target.value);
    });
});

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
