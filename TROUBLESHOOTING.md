# 🔧 THREE.JS GLB MODEL LOADER - TROUBLESHOOTING GUIDE

## ❌ THE MAIN PROBLEM

Your code won't load because you're opening the HTML file directly (file:// protocol). Browsers block loading local resources from subdirectories for security reasons (CORS policy).

**Wrong:** `file:///k:/learncoding/demoprojects/demomodels/index.html`  
**Correct:** `http://localhost:8000`

---

## ✅ HOW TO FIX IT

### Option 1: Use Python Server (EASIEST - Windows)
1. **Double-click** `START_SERVER.bat` in your project folder
2. **Wait** for the message about port 8000
3. **Open** http://localhost:8000 in your browser
4. Your model will load! 🎉

### Option 2: Manual Python Server
```bash
# Navigate to your project folder, then run:
python -m http.server 8000

# Open browser:
http://localhost:8000
```

### Option 3: Use Node.js (if Python not available)
```bash
npm install -g http-server
http-server
```

### Option 4: VS Code Live Server Extension
1. Install "Live Server" extension
2. Right-click `index.html` → "Open with Live Server"
3. Automatically opens on `http://localhost:5500`

---

## 🔍 ISSUES FIXED IN YOUR CODE

| Issue | What Was Wrong | How It's Fixed |
|-------|---|---|
| **file:// Protocol** | CORS blocks local file loading | Added check + error message directing to HTTP |
| **Silent Failures** | No console logs = no debugging info | Added detailed console logging at each step |
| **Unclear Errors** | Generic error message | Now shows specific error types (404, CORS, etc.) |
| **No Diagnostics** | Can't see model dimensions | Logs model size and vertex count |

---

## ✨ WHAT YOUR CODE DOES WELL

✅ Uses absolute positioning with bounding boxes (perfect for different model sizes)  
✅ Dynamic scaling adjusts camera automatically  
✅ Good lighting setup (ambient + directional + accent lights)  
✅ Proper shadow configuration  
✅ Responsive to window resize  
✅ Detailed progress tracking  

---

## 📋 BEST PRACTICES FOR LOADING .GLB MODELS

### 1. **Always Use a Server**
Never use `file://` protocol. Even "local" files need HTTP/HTTPS.

### 2. **Add Progress Tracking**
```javascript
loader.load(
    path,
    onLoad,
    (progress) => {
        const percent = (progress.loaded / progress.total) * 100;
        console.log(`Loading: ${percent.toFixed(0)}%`);
    },
    onError
);
```

### 3. **Use Bounding Box for Auto-Scaling** ✅ (You do this!)
```javascript
const box = new THREE.Box3().setFromObject(model);
const size = box.getSize(new THREE.Vector3());
```

### 4. **Enable Shadows Properly** ✅ (You do this!)
```javascript
model.traverse((child) => {
    if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
    }
});
```

### 5. **Check for Animation Clips**
Some GLB files include animations. You can check:
```javascript
if (gltf.animations.length > 0) {
    console.log('Model has', gltf.animations.length, 'animations');
}
```

### 6. **Handle Different Model Scales**
Your current scale approach is good, but for very large/small models:
```javascript
const maxDim = Math.max(size.x, size.y, size.z);
const scale = 4 / maxDim; // Adjust the "4" to be smaller or larger
model.scale.multiplyScalar(scale);
```

### 7. **Clean Up Models When Switching**
```javascript
if (model) {
    scene.remove(model);
    model = null;
}
```

---

## 🐛 DEBUGGING CHECKLIST

Run this in browser console (F12 → Console):
```javascript
// Check if Three.js loaded
console.log(THREE);  // Should show THREE object

// Check if GLTFLoader loaded
console.log(THREE.GLTFLoader);  // Should exist

// Check if OrbitControls loaded
console.log(OrbitControls);  // Should exist

// Check server protocol
console.log(window.location.protocol);  // Should be "http:" or "https:", NOT "file:"

// Check if model file exists
fetch('models/model.glb')
    .then(r => console.log('Model file exists:', r.ok))
    .catch(e => console.error('Model file not found:', e.message));
```

---

## 🎯 QUICK START

1. **Save this file**
2. **Run:** `START_SERVER.bat` or `python -m http.server 8000`
3. **Open:** http://localhost:8000
4. **Check console** (F12) for detailed loading info
5. **Model should load now** ✅

---

## ⚠️ COMMON MISTAKES

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Opening file directly | Blank canvas, "file://" in URL | Use server |
| Wrong model path | 404 error | Check path: `models/model.glb` ✓ |
| Missing GLTFLoader | `THREE.GLTFLoader is undefined` | Add script tag for GLTFLoader |
| Camera too close | Model invisible | Camera positioned at `z = maxDim * scale * 2` ✓ |
| No lights | All black | Already configured ✓ |
| CORS error | Network error in console | Run from same-origin server |

---

## 📚 RESOURCES

- [Three.js Docs](https://threejs.org/docs/)
- [GLTFLoader Reference](https://threejs.org/docs/#examples/en/loaders/GLTFLoader)
- [Three.js Examples](https://threejs.org/examples/)

---

**Your code is well-written! The only issue was the file:// protocol. Now it should work perfectly!** 🚀
