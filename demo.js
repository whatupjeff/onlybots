// OnlyBots Demo - Interactive Experience State Machine

class OnlyBotsDemo {
    constructor() {
        // State
        this.currentScreen = 'detection';
        this.selectedPerson = null;
        this.currentPrice = 0;
        this.totalPaid = 0;
        this.paymentAttempts = 0;
        this.maxAttempts = 0;
        this.startTime = null;
        this.prices = [];

        // Price ranges for randomization
        this.basePrices = [2.99, 4.99, 7.99, 9.99, 14.99, 19.99, 24.99];
        this.multipliers = [1.5, 2, 2.5, 3, 4, 5];

        // Elements
        this.screens = {
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

    init() {
        this.bindEvents();
        this.showScreen('detection');
    }

    bindEvents() {
        // Person selection
        document.querySelectorAll('.person-card').forEach(card => {
            card.addEventListener('click', () => this.selectPerson(card));
        });

        // Subscribe modal
        document.getElementById('btnYes').addEventListener('click', () => this.confirmSubscribe());
        document.getElementById('btnNo').addEventListener('click', () => this.cancelSubscribe());

        // Pricing
        document.getElementById('btnProceedPay').addEventListener('click', () => this.proceedToPayment());
        document.getElementById('btnCancelPrice').addEventListener('click', () => this.showScreen('detection'));

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
            screen.classList.remove('active');
        });

        // Show target screen
        setTimeout(() => {
            this.screens[screenName].classList.add('active');
            this.currentScreen = screenName;
        }, 100);
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
        this.showScreen('detection');
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

        // Back to detection
        this.showScreen('detection');
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    window.onlyBotsDemo = new OnlyBotsDemo();

    // Console easter egg
    console.log('%c🤖 OnlyBots Demo Mode', 'font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #00d9ff, #00ff94); -webkit-background-clip: text; -webkit-text-fill-color: transparent;');
    console.log('%cThe price will change. It always changes.', 'font-size: 14px; color: #ff4757;');
});
