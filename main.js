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

// Bloch sphere and state vector
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
    
    // Add wireframe
    const wireframe = new THREE.WireframeGeometry(geometry);
    const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0x555555 });
    const wireframeMesh = new THREE.LineSegments(wireframe, wireframeMaterial);
    sphere.add(wireframeMesh);
    
    scene.add(sphere);

    // Add state vector marker
    const markerGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    sphere.add(marker);

    // Physics parameters
    let kappa = 0.1;
    let gamma = 0.01;
    let initialCoherence = 0.5;
    let coherence = initialCoherence;
    let theta = Math.PI / 2; // Bloch sphere angle (initially at equator)
    let phi = 0; // Azimuthal angle

    // Update physics
    function updatePhysics(dt) {
        const noise = Math.sqrt(kappa * dt) * (Math.random() - 0.5);
        coherence *= Math.exp(-gamma * dt);
        coherence += noise * 0.1;
        coherence = Math.max(0, Math.min(coherence, 0.5));
        uniforms.coherence.value = coherence;

        // Simplified mapping: coherence affects theta (latitude on Bloch sphere)
        theta = Math.PI * (1.0 - coherence); // 0 at north pole, π at south pole
        phi += dt * 0.5; // Precession for visual effect

        // Update marker position on Bloch sphere
        const x = Math.sin(theta) * Math.cos(phi);
        const y = Math.sin(theta) * Math.sin(phi);
        const z = Math.cos(theta);
        marker.position.set(x, y, z);
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
    document.getElementById('reset').addEventListener('click', () => {
        coherence = initialCoherence;
        theta = Math.PI / 2;
        phi = 0;
        uniforms.coherence.value = coherence;
    });
});

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
