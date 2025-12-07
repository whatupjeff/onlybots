# OnlyBots 🤖

> Subscribe to anyone. Get robots. No refunds.

A hilarious mixed-reality novelty application for Meta Quest 3 that turns everyday people into "subscription content" with an absurdly frustrating payment loop that always ends in dancing robots.

---

## Inspiration

We've all experienced subscription fatigue. Every app, every service, every piece of content wants us to subscribe. What if we took that to its most absurd conclusion?

**OnlyBots** was born from a simple "what if" moment: *What if you could subscribe to literally anyone you see?* Your coworker? Subscribe. That person at the coffee shop? Subscribe. Your cat? *Subscribe.*

Inspired by the explosion of subscription platforms and the comedic potential of mixed reality, we wanted to create something that makes people laugh while showcasing what's possible with MR technology. The name is a playful nod to a certain platform, but instead of premium content, you get... a dancing robot. Worth every fake penny.

---

## What it does

**OnlyBots** is an interactive mixed-reality experience with two modes:

### 🎥 Camera Detection Mode (Desktop/Mobile)
- Uses your device's camera with **real-time AI person detection**
- Powered by TensorFlow.js COCO-SSD model
- Draws bounding boxes around detected people with names and distance estimates
- Select any detected person to "subscribe" to them

### 🎮 Demo Mode (Works on Quest & All Devices)
- Simulated person detection with sample targets
- Perfect for experiencing the full flow on any device

### 💳 The Subscription Flow
1. **Detect** - Point at people in your environment
2. **Select** - Choose someone to subscribe to
3. **Subscribe?** - "Would you like to subscribe to this person?"
4. **Random Pricing** - See a totally random price ($2.99 to $199.99)
5. **Fake Payment** - Enter any card details (they all work!)
6. **PRICE CHANGED!** - Oops, the price went up. Pay again.
7. **Repeat** - The price keeps changing (2-5 times)
8. **🎉 DANCING ROBOT** - Your reward for perseverance!

The joke is the journey. The frustration is the feature. The robot dance makes it all worth it.

---

## How we built it

### Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **AI/ML** | TensorFlow.js + COCO-SSD Model |
| **Styling** | Custom CSS with CSS Variables |
| **Animations** | Pure CSS animations (no libraries) |
| **Design** | Dark mode, Glassmorphism, Gradient accents |

### Key Features Built

- **Real-time Person Detection**: Using TensorFlow.js COCO-SSD for browser-based ML
- **Responsive UI**: Works on desktop, mobile, and VR headset browsers
- **State Machine**: Clean JavaScript class managing the 7-screen flow
- **Dancing Robot**: Entirely CSS-animated robot with arms, legs, blinking eyes, and a heartbeat
- **Confetti System**: Dynamic particle system for the victory celebration
- **Adaptive Camera**: Multiple camera configurations for cross-device compatibility

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    OnlyBots Demo                        │
├─────────────────────────────────────────────────────────┤
│  Camera Screen                                          │
│  ├── TensorFlow.js Model Loading                        │
│  ├── getUserMedia (multi-config fallback)               │
│  └── Real-time Detection Loop (requestAnimationFrame)   │
├─────────────────────────────────────────────────────────┤
│  State Machine (OnlyBotsDemo class)                     │
│  ├── camera → detection → subscribe → pricing           │
│  ├── payment → processing → repricing (loop)            │
│  └── success (dancing robot + confetti)                 │
├─────────────────────────────────────────────────────────┤
│  Landing Page                                           │
│  └── Marketing site with demo link                      │
└─────────────────────────────────────────────────────────┘
```

---

## Challenges we ran into

### 1. **Meta Quest Browser Camera Access**
The biggest challenge was discovering that **Quest passthrough cameras are not accessible via web browser APIs**. The `getUserMedia` API doesn't expose Quest's passthrough cameras - they require Meta's native SDK through Unity/Unreal.

**Solution**: We implemented graceful fallback with Quest detection. On Quest, users automatically get helpful messaging and can use Demo Mode to experience the full flow.

### 2. **Cross-Browser Camera Compatibility**
Different browsers and devices have different camera constraints and capabilities.

**Solution**: We implemented a multi-configuration fallback system that tries different camera settings until one works.

### 3. **Real-time ML Performance**
Running person detection at 60fps in a browser while keeping the UI responsive.

**Solution**: Using `requestAnimationFrame` for the detection loop and optimizing canvas drawing operations.

### 4. **CSS-Only Robot Animation**
Creating a compelling dancing robot without any animation libraries.

**Solution**: Layered CSS animations with different timings for arms, legs, eyes, mouth, and body - creating a convincing dance entirely in CSS.

---

## Accomplishments that we're proud of

🏆 **Real-time AI Person Detection in Browser** - Running TensorFlow.js COCO-SSD with bounding box visualization at smooth framerates

🏆 **The Perfect Comedic Timing** - The "PRICE CHANGED!" moment with the shake animation and escalating prices genuinely makes people laugh

🏆 **Pure CSS Dancing Robot** - A fully animated robot with personality, built entirely with CSS keyframe animations

🏆 **Adaptive Design** - Works beautifully on desktop, mobile, and even Quest browser (in demo mode)

🏆 **The Confetti System** - A simple but satisfying particle system that makes the victory feel earned

🏆 **Clean Code Architecture** - Well-organized JavaScript classes with clear state management

---

## What we learned

### Technical Learnings
- **WebXR limitations**: Browser-based MR has constraints, especially around hardware camera access on VR headsets
- **TensorFlow.js in production**: How to load and run ML models efficiently in the browser
- **Graceful degradation**: Building experiences that work across vastly different devices
- **CSS animation power**: You can create complex character animations without JavaScript

### Design Learnings
- **Comedy through frustration**: The "price changed" loop is funny *because* it's annoying
- **Payoff matters**: The dancing robot reward makes the absurd journey worth it
- **Dark mode is king**: Professional dark themes with accent colors feel premium

### Product Learnings
- **Know your platform**: Quest browser ≠ Quest native app capabilities
- **Demo mode is essential**: Always have a fallback that showcases your concept
- **Humor is memorable**: People remember experiences that make them laugh

---

## What's next for OnlyBots

### Short-term Improvements
- [ ] **Sound Effects** - Add audio for payments, price changes, and robot dance music
- [ ] **Multiple Robots** - More robot variants for repeat plays
- [ ] **Screenshot Sharing** - Let users share their "subscription complete" moment
- [ ] **Leaderboard** - Track highest total "paid" amounts globally

### Medium-term Features
- [ ] **Voice Lines** - Add absurd subscription-related voice prompts
- [ ] **AR.js Integration** - Marker-based AR for devices without camera access
- [ ] **Multiplayer** - Subscribe to your friends and see their robots

### Long-term Vision
- [ ] **Native Quest App** - Full Unity/Unreal build with actual passthrough
- [ ] **Spatial Computing** - Robots that dance in your actual room
- [ ] **Social Features** - Share and compete with friends

---

## Try It Now!

🌐 **[Live Demo](https://whatupjeff.github.io/onlybots/demo.html)** *(if deployed to GitHub Pages)*

💻 **Local Development**:
```bash
git clone https://github.com/whatupjeff/onlybots.git
cd onlybots
# Open demo.html in your browser
```

---

## Team

Built with ❤️ and an unreasonable amount of fake credit card numbers.

---

*OnlyBots - Because everyone deserves a dancing robot.*
