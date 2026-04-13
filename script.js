// ============================================================================
// THREE.JS 3D MODEL VIEWER - SIMPLIFIED VERSION
// ============================================================================

console.clear();
console.log('%c=== THREE.JS MODEL VIEWER STARTING ===', 'color: blue; font-weight: bold; font-size: 14px;');
console.log('Timestamp:', new Date().toLocaleTimeString());
console.log('');

// Immediate checks
console.log('Checking libraries (raw window check):');
console.log('  window.THREE:', !!window.THREE);
console.log('  window.THREE.GLTFLoader:',  !!window.THREE?.GLTFLoader);
console.log('  window.OrbitControls:', !!window.OrbitControls);
console.log('');

// If any required library is missing, show error and reload
function checkLibraries() {
    // Add small delay in case scripts are still loading
    setTimeout(function() {
        if (!window.THREE) {
            console.error('%c❌ THREE.js is NOT available', 'color: red; font-weight: bold; font-size: 14px;');
            document.getElementById('error-message').innerHTML = '❌ THREE.js failed to load from CDN. Retrying...';
            document.getElementById('error-message').style.display = 'block';
            setTimeout(() => location.reload(), 2000);
            return false;
        }
        
        if (!window.THREE.GLTFLoader) {
            console.error('%c❌ GLTFLoader is NOT available', 'color: red; font-weight: bold; font-size: 14px;');
            console.log('Attempting to access GLTFLoader...', window.THREE.GLTFLoader);
            document.getElementById('error-message').innerHTML = '❌ GLTFLoader failed to load. Retrying...';
            document.getElementById('error-message').style.display = 'block';
            setTimeout(() => location.reload(), 2000);
            return false;
        }
        
        if (!window.OrbitControls) {
            console.error('%c❌ OrbitControls is NOT available', 'color: red; font-weight: bold; font-size: 14px;');
            document.getElementById('error-message').innerHTML = '❌ OrbitControls failed to load. Retrying...';
            document.getElementById('error-message').style.display = 'block';
            setTimeout(() => location.reload(), 2000);
            return false;
        }
        
        console.log('%c✅ All libraries available!', 'color: green; font-weight: bold; font-size: 14px;');
        initializeApp();
    }, 500);
}

// Run library check
checkLibraries();

function initializeApp() {
    try {
        console.log('%c>>> INITIALIZING APPLICATION <<<', 'color: blue; font-weight: bold; font-size: 13px;');
        
        // ================================================
        // SETUP THREE.JS BASICS
        // ================================================
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a2e);
        
        const canvas = document.getElementById('canvas');
        if (!canvas) throw new Error('Canvas element not found');
        
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(0, 0, 5);
        
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        
        console.log('✅ Scene, Camera, Renderer ready');
        
        // ================================================
        // ADD LIGHTS
        // ================================================
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        scene.add(directionalLight);
        
        console.log('✅ Lights added');
        
        // ================================================
        // ADD ORBIT CONTROLS
        // ================================================
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 2;
        controls.enableZoom = true;
        controls.enablePan = true;
        
        console.log('✅ OrbitControls ready');
        
        // ================================================
        // CREATE LOADER AND LOAD MODEL
        // ================================================
        console.log('');
        console.log('%c>>> LOADING MODEL <<<', 'color: orange; font-weight: bold; font-size: 13px;');
        console.log('Creating GLTFLoader...');
        
        const loader = new THREE.GLTFLoader();
        
        console.log('Requesting file: models/model.glb');
        console.log('Server: http://localhost:8000');
        console.log('');
        
        let modelLoaded = false;
        
        loader.load(
            'models/model.glb',
            function onLoad(gltf) {
                modelLoaded = true;
                console.log('%c✅✅✅ MODEL LOADED SUCCESSFULLY ✅✅✅', 'color: white; background: green; font-weight: bold; font-size: 14px; padding: 10px;');
                
                const model = gltf.scene;
                
                // Get model dimensions
                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3());
                const center = box.getCenter(new THREE.Vector3());
                
                console.log('Model dimensions:', { x: size.x.toFixed(2), y: size.y.toFixed(2), z: size.z.toFixed(2) });
                
                // Position and scale model
                model.position.sub(center);
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 4 / maxDim;
                model.scale.multiplyScalar(scale);
                
                scene.add(model);
                
                // Enable shadows
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                // Adjust camera
                camera.position.z = maxDim * scale * 2;
                controls.target.copy(model.position);
                controls.update();
                
                // Count vertices
                let vertexCount = 0;
                model.traverse((child) => {
                    if (child.isMesh && child.geometry) {
                        vertexCount += child.geometry.attributes.position?.count || 0;
                    }
                });
                
                // Update UI
                document.getElementById('loading-container').style.display = 'none';
                document.getElementById('status').textContent = '✅ Model Loaded';
                document.getElementById('vertices').textContent = vertexCount.toLocaleString();
                
                console.log('Vertices:', vertexCount.toLocaleString());
                console.log('%c✅ Ready to interact - use mouse to rotate/zoom', 'color: green; font-weight: bold;');
            },
            function onProgress(progress) {
                if (progress.lengthComputable) {
                    const percent = (progress.loaded / progress.total) * 100;
                    console.log('Loading:', percent.toFixed(0) + '%');
                    document.getElementById('progress-fill').style.width = percent + '%';
                }
            },
            function onError(error) {
                if (modelLoaded) return; // Ignore if already loaded
                
                console.error('%cX MODEL LOAD FAILED X', 'color: white; background: red; font-weight: bold; font-size: 14px; padding: 10px;');
                console.error('Error details:');
                console.error('  Name:', error.constructor.name);
                console.error('  Message:', error.message);
                console.error('  URL attempted: models/model.glb');
                console.error('  Current location: ' + window.location.href);
                console.error('  Stack:', error.stack);
                
                document.getElementById('loading-container').style.display = 'none';
                document.getElementById('status').textContent = '❌ Load Failed';
                document.getElementById('error-message').innerHTML = '❌ Model file not found. Check:<br>1. File exists at k:/learncoding/demoprojects/demomodels/models/model.glb<br>2. Check browser console (F12) for details';
                document.getElementById('error-message').style.display = 'block';
            }
        );
        
        // ================================================
        // ANIMATION LOOP
        // ================================================
        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
        animate();
        
        console.log('✅ Animation loop running');
        
        // ================================================
        // HANDLE WINDOW RESIZE
        // ================================================
        window.addEventListener('resize', () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        });
        
        console.log('%c✅ ✅ ✅ INITIALIZATION COMPLETE ✅ ✅ ✅', 'color: green; font-weight: bold; font-size: 14px;');
        console.log('Waiting for model file to load...');
        console.log('');
        
    } catch (error) {
        console.error('%cFATAL ERROR', 'color: white; background: red; font-weight: bold; font-size: 14px; padding: 10px;');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        
        document.getElementById('loading-container').style.display = 'none';
        document.getElementById('status').textContent = '❌ Error';
        document.getElementById('error-message').innerHTML = '❌ Error: ' + error.message;
        document.getElementById('error-message').style.display = 'block';
    }
}