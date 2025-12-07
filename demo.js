// OnlyBots Demo - Interactive Experience with Real Person Detection

class CameraDetection {
    constructor(onPersonDetected, onPersonLost) {
        this.video = document.getElementById('webcam');
        this.canvas = document.getElementById('detectionCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.overlay = document.getElementById('cameraOverlay');
        this.loadingText = document.getElementById('loadingText');
        this.statusBadge = document.getElementById('cameraStatus');
        this.detectionCount = document.getElementById('cameraDetectionCount');
        this.selectBtn = document.getElementById('btnSelectPerson');
        this.instructions = document.getElementById('cameraInstructions');

        this.model = null;
        this.isRunning = false;
        this.detectedPeople = [];
        this.selectedPerson = null;
        this.onPersonDetected = onPersonDetected;
        this.onPersonLost = onPersonLost;

        // Face capture canvas (offscreen)
        this.faceCanvas = document.createElement('canvas');
        this.faceCtx = this.faceCanvas.getContext('2d');

        // Detection settings
        this.minConfidence = 0.5;

        // Gender-based name pools
        this.maleNames = ['James', 'Michael', 'David', 'Chris', 'Daniel', 'Matthew', 'Andrew', 'Josh', 'Ryan', 'Brandon'];
        this.femaleNames = ['Emma', 'Sophia', 'Olivia', 'Ava', 'Isabella', 'Mia', 'Charlotte', 'Emily', 'Jessica', 'Ashley'];
        this.neutralNames = ['Alex', 'Jordan', 'Sam', 'Riley', 'Taylor', 'Morgan', 'Casey', 'Quinn', 'Jamie', 'Avery'];

        // Track used names to avoid duplicates
        this.usedNames = new Set();
    }

    async init() {
        try {
            // Check if we're on HTTPS (required for camera on Quest)
            if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
                console.warn('Camera requires HTTPS. Current protocol:', location.protocol);
            }

            this.loadingText.textContent = 'Loading AI Model...';

            // Load COCO-SSD model
            this.model = await cocoSsd.load();
            this.loadingText.textContent = 'Accessing Camera...';

            // Try multiple camera configurations for Quest compatibility
            const cameraConfigs = [
                // Config 1: Environment-facing camera (for Quest passthrough-like experience)
                {
                    video: {
                        facingMode: { ideal: 'environment' },
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    },
                    audio: false
                },
                // Config 2: User-facing camera
                {
                    video: {
                        facingMode: 'user',
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    },
                    audio: false
                },
                // Config 3: Any camera with lower resolution
                {
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                    },
                    audio: false
                },
                // Config 4: Just request any video
                {
                    video: true,
                    audio: false
                }
            ];

            let stream = null;
            let lastError = null;

            // Try each configuration until one works
            for (const config of cameraConfigs) {
                try {
                    console.log('Trying camera config:', JSON.stringify(config));
                    stream = await navigator.mediaDevices.getUserMedia(config);
                    console.log('Camera access successful with config:', JSON.stringify(config));
                    break;
                } catch (err) {
                    console.warn('Camera config failed:', err.name, err.message);
                    lastError = err;
                }
            }

            if (!stream) {
                throw lastError || new Error('No camera available');
            }

            this.video.srcObject = stream;

            // Wait for video to be ready
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Video load timeout'));
                }, 10000);

                this.video.onloadedmetadata = () => {
                    clearTimeout(timeout);
                    this.video.play().then(resolve).catch(reject);
                };

                this.video.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error('Video element error'));
                };
            });

            // Set canvas size to match video
            this.canvas.width = this.video.videoWidth || 640;
            this.canvas.height = this.video.videoHeight || 480;

            // Hide overlay
            this.overlay.classList.add('hidden');
            this.statusBadge.innerHTML = '<span class="pulse"></span> DETECTING';

            // Start detection loop
            this.isRunning = true;
            this.detectLoop();

            return true;
        } catch (error) {
            console.error('Camera initialization failed:', error);
            this.showError(error);
            return false;
        }
    }

    showError(error) {
        let message = 'Could not access camera';
        let suggestion = '';

        // Detect if on Quest/VR browser
        const isQuest = /OculusBrowser|Meta Quest/i.test(navigator.userAgent);

        if (error.name === 'NotAllowedError') {
            message = 'Camera access denied.';
            suggestion = 'Please allow camera permissions in your browser settings.';
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
            message = 'No camera found.';
            if (isQuest) {
                suggestion = 'Note: Quest passthrough cameras may not be accessible via browser. Try the demo mode instead!';
            } else {
                suggestion = 'Please connect a camera and try again.';
            }
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
            message = 'Camera is in use by another app.';
            suggestion = 'Please close other apps using the camera.';
        } else if (error.name === 'OverconstrainedError') {
            message = 'Camera does not support requested settings.';
            suggestion = 'Trying with basic settings...';
        } else if (error.name === 'SecurityError' || error.message?.includes('secure')) {
            message = 'HTTPS required for camera access.';
            suggestion = 'Please access this page via HTTPS.';
        } else if (isQuest) {
            message = 'Camera not available on Quest browser.';
            suggestion = 'Quest passthrough requires a native app. Use Demo Mode to experience the app!';
        }

        this.overlay.innerHTML = `
            <div class="camera-error">
                <div class="error-icon">📷❌</div>
                <h3>Camera Error</h3>
                <p>${message}</p>
                ${suggestion ? `<p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">${suggestion}</p>` : ''}
                <button class="btn btn-secondary" onclick="window.onlyBotsDemo.skipToDemo()">
                    Continue to Demo Mode
                </button>
            </div>
        `;
    }

    async detectLoop() {
        if (!this.isRunning) return;

        try {
            // Run detection
            const predictions = await this.model.detect(this.video);

            // Filter for people only
            const people = predictions.filter(p => p.class === 'person' && p.score >= this.minConfidence);

            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Track previous count
            const prevCount = this.detectedPeople.length;

            // Update detected people with face captures
            this.detectedPeople = people.map((person, index) => {
                const bbox = person.bbox;
                const faceImage = this.captureFace(bbox);
                const gender = this.estimateGender(bbox);
                const name = this.getNameForGender(gender, index);

                return {
                    id: index,
                    name: name,
                    gender: gender,
                    confidence: person.score,
                    bbox: bbox, // [x, y, width, height]
                    distance: this.estimateDistance(bbox[3]),
                    faceImage: faceImage
                };
            });

            // Draw bounding boxes
            this.drawDetections();

            // Update UI
            const count = this.detectedPeople.length;
            this.detectionCount.textContent = `${count} ${count === 1 ? 'person' : 'people'} detected`;

            // Enable/disable select button
            if (count > 0) {
                this.selectBtn.disabled = false;
                this.instructions.textContent = '✅ Person detected! Click to select and subscribe';
            } else {
                this.selectBtn.disabled = true;
                this.instructions.textContent = '📷 Point your camera at people to detect them';
            }

            // Callbacks
            if (count > 0 && prevCount === 0) {
                this.onPersonDetected?.(this.detectedPeople);
            } else if (count === 0 && prevCount > 0) {
                this.onPersonLost?.();
            }

        } catch (error) {
            console.error('Detection error:', error);
        }

        // Continue loop
        requestAnimationFrame(() => this.detectLoop());
    }

    // Capture face/upper body from bounding box
    captureFace(bbox) {
        try {
            const [x, y, width, height] = bbox;

            // Focus on upper portion (head/face area)
            const faceY = y;
            const faceHeight = Math.min(height * 0.5, width * 1.2); // Upper half, roughly square
            const faceWidth = width;

            // Set up capture canvas
            const captureSize = 150;
            this.faceCanvas.width = captureSize;
            this.faceCanvas.height = captureSize;

            // Draw the face region to canvas
            this.faceCtx.drawImage(
                this.video,
                x, faceY, faceWidth, faceHeight,  // Source rectangle
                0, 0, captureSize, captureSize     // Destination (scaled to square)
            );

            // Return as data URL
            return this.faceCanvas.toDataURL('image/jpeg', 0.8);
        } catch (e) {
            console.warn('Face capture failed:', e);
            return null;
        }
    }

    // Estimate gender based on bounding box proportions
    // This is a rough heuristic - in reality you'd use a proper ML model
    estimateGender(bbox) {
        const [x, y, width, height] = bbox;
        const aspectRatio = height / width;

        // Rough heuristic based on body proportions
        // Wider shoulders relative to height might indicate male
        // This is NOT accurate - just for demo purposes
        const random = Math.random();

        if (aspectRatio > 2.5) {
            // Taller/thinner - could be either, use random with slight female bias
            return random > 0.45 ? 'female' : (random > 0.2 ? 'male' : 'neutral');
        } else if (aspectRatio < 2.0) {
            // Wider/shorter - could be either, use random with slight male bias
            return random > 0.45 ? 'male' : (random > 0.2 ? 'female' : 'neutral');
        }

        // Medium proportions - truly random
        if (random > 0.66) return 'male';
        if (random > 0.33) return 'female';
        return 'neutral';
    }

    // Get a name based on estimated gender
    getNameForGender(gender, index) {
        let namePool;

        if (gender === 'male') {
            namePool = this.maleNames;
        } else if (gender === 'female') {
            namePool = this.femaleNames;
        } else {
            namePool = this.neutralNames;
        }

        // Try to get an unused name
        for (const name of namePool) {
            if (!this.usedNames.has(name)) {
                this.usedNames.add(name);
                return name;
            }
        }

        // Fallback: use index-based name from pool
        return namePool[index % namePool.length];
    }

    // Get all detected people with their face images
    getDetectedPeopleWithFaces() {
        return this.detectedPeople.map(person => ({
            ...person,
            faceImage: person.faceImage || this.getDefaultAvatar(person.gender)
        }));
    }

    // Default avatar based on gender
    getDefaultAvatar(gender) {
        if (gender === 'male') return '👨';
        if (gender === 'female') return '👩';
        return '🧑';
    }

    drawDetections() {
        this.detectedPeople.forEach((person, index) => {
            const [x, y, width, height] = person.bbox;

            // Draw bounding box
            this.ctx.strokeStyle = '#00d9ff';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(x, y, width, height);

            // Draw corner accents
            const cornerSize = 20;
            this.ctx.strokeStyle = '#00ff94';
            this.ctx.lineWidth = 4;

            // Top-left corner
            this.ctx.beginPath();
            this.ctx.moveTo(x, y + cornerSize);
            this.ctx.lineTo(x, y);
            this.ctx.lineTo(x + cornerSize, y);
            this.ctx.stroke();

            // Top-right corner
            this.ctx.beginPath();
            this.ctx.moveTo(x + width - cornerSize, y);
            this.ctx.lineTo(x + width, y);
            this.ctx.lineTo(x + width, y + cornerSize);
            this.ctx.stroke();

            // Bottom-left corner
            this.ctx.beginPath();
            this.ctx.moveTo(x, y + height - cornerSize);
            this.ctx.lineTo(x, y + height);
            this.ctx.lineTo(x + cornerSize, y + height);
            this.ctx.stroke();

            // Bottom-right corner
            this.ctx.beginPath();
            this.ctx.moveTo(x + width - cornerSize, y + height);
            this.ctx.lineTo(x + width, y + height);
            this.ctx.lineTo(x + width, y + height - cornerSize);
            this.ctx.stroke();

            // Draw label background
            const label = `${person.name} • ${person.distance}m`;
            this.ctx.font = 'bold 16px Outfit, sans-serif';
            const textWidth = this.ctx.measureText(label).width;

            this.ctx.fillStyle = 'rgba(0, 217, 255, 0.9)';
            this.ctx.fillRect(x, y - 30, textWidth + 20, 26);

            // Draw label text
            this.ctx.fillStyle = '#0a0a0f';
            this.ctx.fillText(label, x + 10, y - 10);

            // Draw confidence bar
            const barWidth = width * person.confidence;
            this.ctx.fillStyle = '#00ff94';
            this.ctx.fillRect(x, y + height + 5, barWidth, 4);
            this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x, y + height + 5, width, 4);
        });
    }

    estimateDistance(height) {
        // Rough distance estimation based on bounding box height
        // Assuming average person height ~170cm in full frame = ~1m distance
        const referenceHeight = 400; // pixels at 1m
        const distance = referenceHeight / height;
        return Math.max(0.5, Math.min(10, distance)).toFixed(1);
    }

    getSelectedPerson() {
        if (this.detectedPeople.length > 0) {
            // Return the most prominent (largest) person
            const largest = this.detectedPeople.reduce((prev, current) =>
                (prev.bbox[2] * prev.bbox[3]) > (current.bbox[2] * current.bbox[3]) ? prev : current
            );
            return largest;
        }
        return null;
    }

    stop() {
        this.isRunning = false;
        if (this.video.srcObject) {
            this.video.srcObject.getTracks().forEach(track => track.stop());
        }
    }
}

class OnlyBotsDemo {
    constructor() {
        // State
        this.currentScreen = 'camera';
        this.selectedPerson = null;
        this.currentPrice = 0;
        this.totalPaid = 0;
        this.paymentAttempts = 0;
        this.maxAttempts = 0;
        this.startTime = null;
        this.prices = [];
        this.cameraDetection = null;

        // Price ranges for randomization
        this.basePrices = [2.99, 4.99, 7.99, 9.99, 14.99, 19.99, 24.99];
        this.multipliers = [1.5, 2, 2.5, 3, 4, 5];

        // Elements
        this.screens = {
            camera: document.getElementById('screen-camera'),
            personPicker: document.getElementById('screen-person-picker'),
            detection: document.getElementById('screen-detection'),
            subscribe: document.getElementById('screen-subscribe'),
            pricing: document.getElementById('screen-pricing'),
            payment: document.getElementById('screen-payment'),
            processing: document.getElementById('screen-processing'),
            repricing: document.getElementById('screen-repricing'),
            success: document.getElementById('screen-success')
        };

        this.init();
    }

    async init() {
        this.bindEvents();
        this.showScreen('camera');

        // Initialize camera detection
        this.cameraDetection = new CameraDetection(
            (people) => console.log('People detected:', people.length),
            () => console.log('No people in view')
        );

        await this.cameraDetection.init();
    }

    bindEvents() {
        // Camera screen buttons
        document.getElementById('btnSelectPerson').addEventListener('click', () => this.showPersonPicker());
        document.getElementById('btnSkipCamera').addEventListener('click', () => this.skipToDemo());

        // Person picker - back button
        document.getElementById('btnBackToCamera').addEventListener('click', () => this.showScreen('camera'));

        // Person selection (fallback demo mode)
        document.querySelectorAll('.person-card').forEach(card => {
            card.addEventListener('click', () => this.selectPerson(card));
        });

        // Subscribe modal
        document.getElementById('btnYes').addEventListener('click', () => this.confirmSubscribe());
        document.getElementById('btnNo').addEventListener('click', () => this.cancelSubscribe());

        // Pricing
        document.getElementById('btnProceedPay').addEventListener('click', () => this.proceedToPayment());
        document.getElementById('btnCancelPrice').addEventListener('click', () => this.showScreen('camera'));

        // Payment form
        document.getElementById('paymentForm').addEventListener('submit', (e) => this.submitPayment(e));

        // Card number formatting
        document.getElementById('cardNumber').addEventListener('input', (e) => this.formatCardNumber(e));
        document.getElementById('cardExpiry').addEventListener('input', (e) => this.formatExpiry(e));

        // Repricing
        document.getElementById('btnPayAgain').addEventListener('click', () => this.payAgain());
        document.getElementById('btnRageQuit').addEventListener('click', () => this.rageQuit());

        // Restart
        document.getElementById('btnRestart').addEventListener('click', () => this.restart());
    }

    showScreen(screenName) {
        // Hide all screens
        Object.values(this.screens).forEach(screen => {
            if (screen) screen.classList.remove('active');
        });

        // Show target screen
        setTimeout(() => {
            if (this.screens[screenName]) {
                this.screens[screenName].classList.add('active');
            }
            this.currentScreen = screenName;
        }, 100);
    }

    showPersonPicker() {
        // Get all detected people with their faces
        const people = this.cameraDetection.getDetectedPeopleWithFaces();

        if (people.length === 0) {
            console.warn('No people detected');
            return;
        }

        // Render the person picker grid
        const grid = document.getElementById('personPickerGrid');
        grid.innerHTML = '';

        people.forEach((person, index) => {
            const card = document.createElement('div');
            card.className = 'person-picker-card';
            card.onclick = () => this.selectPersonFromPicker(person);

            // Determine if we have a face image or need a fallback
            const hasFaceImage = person.faceImage && person.faceImage.startsWith('data:');

            card.innerHTML = `
                <div class="person-face-container">
                    ${hasFaceImage
                    ? `<img src="${person.faceImage}" alt="${person.name}" class="person-face-img">`
                    : `<div class="person-face-img" style="display:flex;align-items:center;justify-content:center;font-size:3rem;background:var(--bg-elevated);">${this.getGenderEmoji(person.gender)}</div>`
                }
                </div>
                <div class="person-picker-name">${person.name}</div>
                <div class="person-picker-info">${person.distance}m away • ${Math.round(person.confidence * 100)}% match</div>
                <div class="person-picker-badge">TAP TO SUBSCRIBE</div>
            `;

            grid.appendChild(card);
        });

        this.showScreen('personPicker');
    }

    getGenderEmoji(gender) {
        if (gender === 'male') return '👨';
        if (gender === 'female') return '👩';
        return '🧑';
    }

    selectPersonFromPicker(person) {
        this.selectedPerson = {
            id: person.id,
            name: person.name,
            type: 'Detected',
            gender: person.gender,
            avatar: person.faceImage || this.getGenderEmoji(person.gender),
            confidence: person.confidence,
            distance: person.distance,
            faceImage: person.faceImage
        };

        // Update subscribe modal with face image or emoji
        const avatarEl = document.getElementById('selectedAvatar');
        if (person.faceImage && person.faceImage.startsWith('data:')) {
            avatarEl.innerHTML = `<img src="${person.faceImage}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;">`;
        } else {
            avatarEl.textContent = this.getGenderEmoji(person.gender);
        }
        document.getElementById('selectedName').textContent = person.name;

        this.showScreen('subscribe');
        this.startTime = Date.now();
    }

    skipToDemo() {
        // Stop camera
        if (this.cameraDetection) {
            this.cameraDetection.stop();
        }
        this.showScreen('detection');
    }

    selectPerson(card) {
        this.selectedPerson = {
            id: card.dataset.id,
            name: card.dataset.name,
            type: card.dataset.type,
            avatar: card.querySelector('.person-avatar').textContent
        };

        // Update subscribe modal
        document.getElementById('selectedAvatar').textContent = this.selectedPerson.avatar;
        document.getElementById('selectedName').textContent = this.selectedPerson.name;

        this.showScreen('subscribe');
        this.startTime = Date.now();
    }

    confirmSubscribe() {
        // Generate initial price
        this.currentPrice = this.generateRandomPrice();
        this.prices = [this.currentPrice];

        // Determine how many payment loops (2-5)
        this.maxAttempts = Math.floor(Math.random() * 4) + 2;
        this.paymentAttempts = 1;

        // Update pricing display
        document.getElementById('priceAmount').textContent = this.currentPrice.toFixed(2);

        this.showScreen('pricing');
    }

    cancelSubscribe() {
        this.selectedPerson = null;
        // Go back to camera if it was running, otherwise detection
        if (this.cameraDetection && this.cameraDetection.isRunning) {
            this.showScreen('camera');
        } else {
            this.showScreen('detection');
        }
    }

    generateRandomPrice() {
        const basePrice = this.basePrices[Math.floor(Math.random() * this.basePrices.length)];
        return basePrice;
    }

    generateHigherPrice(currentPrice) {
        const multiplier = this.multipliers[Math.floor(Math.random() * this.multipliers.length)];
        const increase = Math.random() * 20 + 5; // $5-$25 increase
        return Math.round((currentPrice * multiplier + increase) * 100) / 100;
    }

    proceedToPayment() {
        document.getElementById('paymentTotal').textContent = this.currentPrice.toFixed(2);
        this.clearPaymentForm();
        this.showScreen('payment');
    }

    clearPaymentForm() {
        document.getElementById('cardNumber').value = '';
        document.getElementById('cardExpiry').value = '';
        document.getElementById('cardCvv').value = '';
        document.getElementById('cardName').value = '';
        document.getElementById('btnSubmitPayment').classList.remove('loading');
    }

    formatCardNumber(e) {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(.{4})/g, '$1 ').trim();
        e.target.value = value;
    }

    formatExpiry(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    }

    submitPayment(e) {
        e.preventDefault();

        const submitBtn = document.getElementById('btnSubmitPayment');
        submitBtn.classList.add('loading');

        // Show processing
        setTimeout(() => {
            this.showScreen('processing');

            // Process "payment" (always succeeds after delay)
            setTimeout(() => {
                this.processPaymentResult();
            }, 2000);
        }, 500);
    }

    processPaymentResult() {
        // Add to total paid
        this.totalPaid += this.currentPrice;

        // Check if we need more payments
        if (this.paymentAttempts < this.maxAttempts) {
            // PRICE CHANGED!
            const oldPrice = this.currentPrice;
            this.currentPrice = this.generateHigherPrice(oldPrice);
            this.prices.push(this.currentPrice);
            this.paymentAttempts++;

            // Update repricing screen
            document.getElementById('oldPrice').textContent = oldPrice.toFixed(2);
            document.getElementById('newPrice').textContent = this.currentPrice.toFixed(2);
            document.getElementById('attemptCount').textContent = this.paymentAttempts;
            document.getElementById('totalAttempts').textContent = this.maxAttempts;

            this.showScreen('repricing');
        } else {
            // SUCCESS!
            this.showSuccess();
        }
    }

    payAgain() {
        document.getElementById('paymentTotal').textContent = this.currentPrice.toFixed(2);
        this.clearPaymentForm();
        this.showScreen('payment');
    }

    rageQuit() {
        // Easter egg - still show success but with shame
        this.showSuccess();
    }

    showSuccess() {
        // Calculate time spent
        const timeSpent = Math.round((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(timeSpent / 60);
        const seconds = timeSpent % 60;
        const timeString = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

        // Update stats
        document.getElementById('totalPaid').textContent = '$' + this.totalPaid.toFixed(2);
        document.getElementById('statPayments').textContent = this.paymentAttempts;
        document.getElementById('statTime').textContent = timeString;

        this.showScreen('success');
        this.startConfetti();
    }

    startConfetti() {
        const container = document.getElementById('confettiContainer');
        container.innerHTML = '';

        const colors = ['#00d9ff', '#00ff94', '#ffcc00', '#ff4757', '#ffffff'];
        const shapes = ['■', '●', '▲', '★', '♦'];

        // Create confetti pieces
        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.textContent = shapes[Math.floor(Math.random() * shapes.length)];
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.color = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.fontSize = (Math.random() * 15 + 10) + 'px';
                confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
                confetti.style.animationDelay = (Math.random() * 2) + 's';
                container.appendChild(confetti);

                // Remove after animation
                setTimeout(() => confetti.remove(), 6000);
            }, i * 50);
        }

        // Keep spawning confetti
        this.confettiInterval = setInterval(() => {
            if (this.currentScreen !== 'success') {
                clearInterval(this.confettiInterval);
                return;
            }

            for (let i = 0; i < 5; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.textContent = shapes[Math.floor(Math.random() * shapes.length)];
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.color = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.fontSize = (Math.random() * 15 + 10) + 'px';
                confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
                container.appendChild(confetti);

                setTimeout(() => confetti.remove(), 6000);
            }
        }, 1000);
    }

    restart() {
        // Reset state
        this.selectedPerson = null;
        this.currentPrice = 0;
        this.totalPaid = 0;
        this.paymentAttempts = 0;
        this.maxAttempts = 0;
        this.startTime = null;
        this.prices = [];

        // Clear confetti
        if (this.confettiInterval) {
            clearInterval(this.confettiInterval);
        }
        document.getElementById('confettiContainer').innerHTML = '';

        // Back to camera if available
        if (this.cameraDetection && this.cameraDetection.isRunning) {
            this.showScreen('camera');
        } else {
            this.showScreen('detection');
        }
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    window.onlyBotsDemo = new OnlyBotsDemo();

    // Console easter egg
    console.log('%c🤖 OnlyBots Demo Mode', 'font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #00d9ff, #00ff94); -webkit-background-clip: text; -webkit-text-fill-color: transparent;');
    console.log('%c📷 Camera passthrough enabled with AI person detection', 'font-size: 14px; color: #00ff94;');
    console.log('%cThe price will change. It always changes.', 'font-size: 14px; color: #ff4757;');
});
