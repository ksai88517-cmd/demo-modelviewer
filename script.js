// ============================================================================
// THREE.JS 3D MODEL VIEWER - UPLOAD FIRST VERSION
// ============================================================================

console.clear();
console.log('%c=== THREE.JS MODEL VIEWER STARTING ===', 'color: blue; font-weight: bold; font-size: 14px;');
console.log('Timestamp:', new Date().toLocaleTimeString());
console.log('');

const SUPPORTED_EXTENSIONS = ['glb', 'gltf', 'fbx'];

const state = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    currentModel: null,
    activeMixer: null,
    loadingUrl: null,
    currentModelName: '',
    clock: new THREE.Clock(),
};

console.log('Checking libraries (raw window check):');
console.log('  window.THREE:', !!window.THREE);
console.log('  window.THREE.GLTFLoader:', !!window.THREE?.GLTFLoader);
console.log('  window.THREE.FBXLoader:', !!window.THREE?.FBXLoader);
console.log('  window.THREE.OrbitControls:', !!window.THREE?.OrbitControls);
console.log('');

checkLibraries();

function checkLibraries() {
    setTimeout(() => {
        if (!window.THREE) {
            showError('❌ THREE.js failed to load. Check the local vendor files.');
            return;
        }

        if (!window.THREE.GLTFLoader) {
            showError('❌ GLTFLoader failed to load. Check the local vendor files.');
            return;
        }

        if (!window.THREE.FBXLoader) {
            showError('❌ FBXLoader failed to load. Check the local vendor files.');
            return;
        }

        if (!window.THREE.OrbitControls) {
            showError('❌ OrbitControls failed to load. Check the local vendor files.');
            return;
        }

        console.log('%c✅ All libraries available!', 'color: green; font-weight: bold; font-size: 14px;');
        initializeApp();
    }, 100);
}

function initializeApp() {
    try {
        const canvas = document.getElementById('canvas');
        if (!canvas) throw new Error('Canvas element not found');

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x11131f);

        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 5);

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.4);
        directionalLight.position.set(8, 14, 10);
        scene.add(directionalLight);

        const fillLight = new THREE.DirectionalLight(0x88aaff, 0.5);
        fillLight.position.set(-8, 4, -6);
        scene.add(fillLight);

        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.06;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.5;
        controls.enableZoom = true;
        controls.enablePan = true;

        state.scene = scene;
        state.camera = camera;
        state.renderer = renderer;
        state.controls = controls;

        wireBackButton();
        wireUploadUi();
        setupResize();
        animate();

        document.getElementById('status').textContent = 'Waiting for upload';
        document.getElementById('vertices').textContent = '-';
        document.getElementById('loading-container').style.display = 'none';

        console.log('%c✅ App initialized and waiting for file upload', 'color: green; font-weight: bold;');
    } catch (error) {
        showError('❌ Error: ' + error.message);
    }
}

function wireUploadUi() {
    const fileInput = document.getElementById('model-upload');
    const folderInput = document.getElementById('gltf-folder-upload');
    const dropzone = document.getElementById('upload-dropzone');

    fileInput.addEventListener('change', handleSelectedFiles);
    folderInput.addEventListener('change', handleSelectedFiles);

    dropzone.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropzone.classList.add('is-dragover');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('is-dragover');
    });

    dropzone.addEventListener('drop', (event) => {
        event.preventDefault();
        dropzone.classList.remove('is-dragover');

        const files = event.dataTransfer.files;
        if (files && files.length > 0) {
            loadModelFromFiles(Array.from(files));
        }
    });
}

function wireBackButton() {
    const backButton = document.getElementById('back-button');
    backButton.addEventListener('click', resetToSplashScreen);
}

function handleSelectedFiles(event) {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length > 0) {
        loadModelFromFiles(files);
    }

    event.target.value = '';
}

function loadModelFromFiles(files) {
    const modelFile = files.find((file) => SUPPORTED_EXTENSIONS.includes(getFileExtension(file.name)));
    if (!modelFile) {
        showError('❌ No supported 3D model file found. Please upload a .glb, .gltf, or .fbx file.');
        return;
    }

    const extension = getFileExtension(modelFile.name);
    const companionFiles = files.filter((file) => file !== modelFile);

    if (extension !== 'gltf' && companionFiles.length > 0) {
        showError('⚠️ Extra files were ignored. For .glb and .fbx, upload only the model file.');
    }

    loadModelFromFile(modelFile, companionFiles);
}

function loadModelFromFile(file, companionFiles = []) {
    const extension = getFileExtension(file.name);
    if (!SUPPORTED_EXTENSIONS.includes(extension)) {
        showError('❌ Unsupported file type. Please upload .glb, .gltf, or .fbx.');
        return;
    }

    hideError();
    showLoading('Loading ' + file.name + '...');
    document.getElementById('status').textContent = 'Loading ' + file.name;

    clearCurrentModel();

    if (extension === 'fbx') {
        loadFbxFile(file);
        return;
    }

    if (extension === 'gltf') {
        loadGltfFile(file, companionFiles);
        return;
    }

    loadGlbFile(file);
}

function loadGlbFile(file) {
    const loader = new THREE.GLTFLoader();
    const objectUrl = URL.createObjectURL(file);
    state.loadingUrl = objectUrl;

    loader.load(
        objectUrl,
        (gltf) => {
            URL.revokeObjectURL(objectUrl);
            state.loadingUrl = null;
            onModelLoaded(gltf.scene, gltf.animations, file.name);
        },
        (progress) => {
            if (progress.lengthComputable) {
                updateProgress((progress.loaded / progress.total) * 100);
            }
        },
        (error) => {
            URL.revokeObjectURL(objectUrl);
            state.loadingUrl = null;
            showError('❌ Could not load ' + file.name + '. Make sure it is a valid .glb file.');
            console.error(error);
        }
    );
}

function loadGltfFile(file, companionFiles = []) {
    const dependencyMap = createDependencyMap(file, companionFiles);
    const reader = new FileReader();
    reader.onload = () => {
        const manager = new THREE.LoadingManager();
        const cleanup = applyDependencyMap(manager, dependencyMap);
        const loader = new THREE.GLTFLoader(manager);
        const basePath = getFolderFromUploadPath(file);
        loader.parse(
            String(reader.result),
            basePath,
            (gltf) => {
                cleanup();
                onModelLoaded(gltf.scene, gltf.animations, file.name);
            },
            (error) => {
                cleanup();
                showError('❌ Could not load ' + file.name + '. Upload the matching .bin and texture files or the whole folder.');
                console.error(error);
            }
        );
    };
    reader.onerror = () => showError('❌ Could not read ' + file.name + '.');
    reader.readAsText(file);
}

function loadFbxFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
        const loader = new THREE.FBXLoader();
        const model = loader.parse(reader.result, '');
        onModelLoaded(model, model.animations || [], file.name);
    };
    reader.onerror = () => showError('❌ Could not read ' + file.name + '.');
    reader.readAsArrayBuffer(file);
}

function onModelLoaded(model, animations, fileName) {
    if (!state.scene) return;

    hideLoading();
    hideError();
    clearCurrentModel();

    state.currentModel = model;
    state.scene.add(model);
    prepareModel(model);
    frameModel(model);

    const vertexCount = countVertices(model);
    document.getElementById('loading-container').style.display = 'none';
    document.getElementById('status').textContent = 'Loaded: ' + fileName;
    document.getElementById('vertices').textContent = vertexCount.toLocaleString();
    state.currentModelName = fileName;

    if (animations && animations.length > 0) {
        state.activeMixer = new THREE.AnimationMixer(model);
        animations.forEach((clip) => {
            state.activeMixer.clipAction(clip).play();
        });
    } else {
        state.activeMixer = null;
    }

    document.body.classList.add('viewer-ready');
    document.getElementById('back-button').style.display = 'inline-flex';
    console.log('Loaded model:', fileName, 'Vertices:', vertexCount);
}

function prepareModel(model) {
    model.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
}

function frameModel(model) {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    model.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 4 / maxDim;
    model.scale.setScalar(scale);

    const fittedSize = maxDim * scale;
    state.camera.position.set(0, 0, Math.max(3, fittedSize * 2.5));
    state.controls.target.set(0, 0, 0);
    state.controls.update();
}

function countVertices(model) {
    let vertexCount = 0;
    model.traverse((child) => {
        if (child.isMesh && child.geometry?.attributes?.position) {
            vertexCount += child.geometry.attributes.position.count || 0;
        }
    });
    return vertexCount;
}

function clearCurrentModel() {
    if (state.currentModel) {
        disposeObject3D(state.currentModel);
        state.scene.remove(state.currentModel);
        state.currentModel = null;
    }

    if (state.loadingUrl) {
        URL.revokeObjectURL(state.loadingUrl);
        state.loadingUrl = null;
    }

    state.activeMixer = null;
}

function resetToSplashScreen() {
    clearCurrentModel();
    hideError();
    hideLoading();
    document.body.classList.remove('viewer-ready');
    document.getElementById('back-button').style.display = 'none';
    document.getElementById('status').textContent = 'Waiting for upload';
    document.getElementById('vertices').textContent = '-';
    document.getElementById('loading-text').textContent = 'Loading file...';
    document.getElementById('progress-fill').style.width = '0%';
    state.currentModelName = '';
    if (state.controls) {
        state.controls.target.set(0, 0, 0);
        state.controls.update();
    }
}

function disposeObject3D(object) {
    object.traverse((child) => {
        if (child.geometry) {
            child.geometry.dispose();
        }

        if (child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((material) => {
                Object.keys(material).forEach((key) => {
                    const value = material[key];
                    if (value && value.isTexture) {
                        value.dispose();
                    }
                });
                material.dispose();
            });
        }
    });
}

function setupResize() {
    window.addEventListener('resize', () => {
        if (!state.camera || !state.renderer) return;
        const width = window.innerWidth;
        const height = window.innerHeight;
        state.camera.aspect = width / height;
        state.camera.updateProjectionMatrix();
        state.renderer.setSize(width, height);
    });
}

function animate() {
    requestAnimationFrame(animate);

    const delta = state.clock.getDelta();
    if (state.activeMixer) {
        state.activeMixer.update(delta);
    }

    if (state.controls) {
        state.controls.update();
    }

    if (state.renderer && state.scene && state.camera) {
        state.renderer.render(state.scene, state.camera);
    }
}

function showLoading(message) {
    document.getElementById('loading-text').textContent = message;
    document.getElementById('progress-fill').style.width = '0%';
    document.getElementById('loading-container').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading-container').style.display = 'none';
}

function updateProgress(percent) {
    document.getElementById('progress-fill').style.width = Math.min(100, Math.max(0, percent)) + '%';
}

function showError(message) {
    hideLoading();
    const errorMessage = document.getElementById('error-message');
    errorMessage.innerHTML = message;
    errorMessage.style.display = 'block';
}

function hideError() {
    document.getElementById('error-message').style.display = 'none';
}

function getFileExtension(fileName) {
    const parts = fileName.toLowerCase().split('.');
    return parts.length > 1 ? parts.pop() : '';
}

function createDependencyMap(modelFile, companionFiles) {
    const map = new Map();
    const modelFolder = getFolderFromUploadPath(modelFile);

    companionFiles.forEach((file) => {
        const objectUrl = URL.createObjectURL(file);
        const uploadPath = getFolderFromUploadPath(file) + file.name;
        const relativeKey = modelFolder + file.name;

        map.set(uploadPath, objectUrl);
        map.set(relativeKey, objectUrl);
        map.set(file.name, objectUrl);
    });

    return map;
}

function applyDependencyMap(manager, dependencyMap) {
    manager.setURLModifier((url) => {
        const normalizedUrl = url.split('?')[0].split('#')[0];
        if (dependencyMap.has(normalizedUrl)) {
            return dependencyMap.get(normalizedUrl);
        }

        const fileName = normalizedUrl.split('/').pop();
        if (dependencyMap.has(fileName)) {
            return dependencyMap.get(fileName);
        }

        return url;
    });

    return () => {
        dependencyMap.forEach((objectUrl) => URL.revokeObjectURL(objectUrl));
    };
}

function getFolderFromName(fileName) {
    const slashIndex = fileName.lastIndexOf('/');
    const backslashIndex = fileName.lastIndexOf('\\');
    const index = Math.max(slashIndex, backslashIndex);
    return index >= 0 ? fileName.slice(0, index + 1) : '';
}

function getFolderFromUploadPath(file) {
    if (file.webkitRelativePath) {
        const slashIndex = file.webkitRelativePath.lastIndexOf('/');
        return slashIndex >= 0 ? file.webkitRelativePath.slice(0, slashIndex + 1) : '';
    }

    return getFolderFromName(file.name);
}