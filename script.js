document.addEventListener('DOMContentLoaded', () => {
    const muyu = document.getElementById('muyu');
    const meritDisplay = document.getElementById('merit-count');
    const container = document.querySelector('.muyu-container');
    const resetBtn = document.getElementById('reset-btn');
    const particlesContainer = document.getElementById('particles-container');
    
    // State
    let merit = parseInt(localStorage.getItem('cyber_merit')) || 0;
    updateDisplay();

    // Audio Setup
    let audioCtx;
    
    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function playWoodenSound() {
        initAudio();
        
        const t = audioCtx.currentTime;
        
        // Oscillator for the "knock" tone
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        // Wood block frequency around 800-1200Hz
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(400, t + 0.1); // Pitch drop
        
        // Envelope: Instant attack, short decay
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(1, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        
        // Filter to make it sound "wooden" (remove harsh highs)
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 2000;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(t);
        osc.stop(t + 0.2);
    }

    // Interaction Function
    function knock(e) {
        // Update State
        merit++;
        localStorage.setItem('cyber_merit', merit);
        updateDisplay();
        
        // Audio
        playWoodenSound();
        
        // Visuals: Scale Animation (handled by CSS class/active state, but we can force it for keyboard)
        muyu.classList.remove('active');
        void muyu.offsetWidth; // Trigger reflow
        muyu.classList.add('active');
        setTimeout(() => muyu.classList.remove('active'), 100);

        // Visuals: Ripple
        const ripple = document.createElement('div');
        ripple.classList.add('ripple-ring', 'ripple-active');
        container.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);

        // Visuals: Floating Text
        spawnParticle(e);
    }

    function spawnParticle(e) {
        const particle = document.createElement('div');
        particle.classList.add('merit-particle');
        particle.textContent = `功德 +1`;
        
        // Position
        let x, y;
        if (e && e.type === 'click') {
            x = e.clientX;
            y = e.clientY;
        } else {
            // Center of the muyu for keyboard
            const rect = muyu.getBoundingClientRect();
            x = rect.left + rect.width / 2;
            y = rect.top + rect.height / 2;
            
            // Add some randomness
            x += (Math.random() - 0.5) * 40;
            y += (Math.random() - 0.5) * 40;
        }
        
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        
        particlesContainer.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }

    function updateDisplay() {
        meritDisplay.textContent = merit;
    }

    // Event Listeners
    muyu.addEventListener('click', knock);
    
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault(); // Prevent scrolling
            knock();
        }
    });

    resetBtn.addEventListener('click', () => {
        if(confirm('RESET SYSTEM KARMA? // 重置功德？')) {
            merit = 0;
            localStorage.setItem('cyber_merit', 0);
            updateDisplay();
        }
    });
});
