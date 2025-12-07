# OnlyBots - Implementation TODO List

## Overview
Building an interactive web demo/prototype that simulates the OnlyBots MR experience.

---

## ✅ Completed

### Phase 0: Landing Page
- [x] **Landing Page** - Modern dark mode professional landing page
- [x] **Link to Demo** - Added navigation to demo from landing page

### Phase 1: App Demo Structure
- [x] **1.1 Create Demo App Page** (`demo.html`)
  - Separate page for the interactive demo experience
  - Full-screen immersive dark UI with scanlines effect

### Phase 2: Person Detection & Selection (Simulated)
- [x] **2.1 Passthrough Simulation**
  - Created simulated "camera view" environment with grid background
  - Show sample people/avatars that can be detected (3 targets)
  
- [x] **2.2 Person Highlighting**
  - Clickable/hoverable person cards with bounding box effect
  - Pulse animation on selection
  - Highlight and "TAP TO SELECT" hint on hover

### Phase 3: Subscription Prompt
- [x] **3.1 Subscribe Modal**
  - Floating panel: "Would you like to subscribe to him/her?"
  - Yes / No buttons with hover effects
  - No → Return to selection
  - Yes → Proceed to pricing
  - Shows selected person avatar and name

### Phase 4: Random Pricing Generator
- [x] **4.1 Price Display**
  - Random price generation from base prices ($2.99 - $24.99)
  - "Proceed to Pay" button
  - Feature list for subscription
  - Gradient animated price display

### Phase 5: Dummy Payment Page
- [x] **5.1 Payment Form UI**
  - Card number input with formatting (accepts any value)
  - Expiration date input with MM/YY formatting
  - CVV input
  - Cardholder name input
  - Submit button with loading state
  - Processing spinner animation
  - Always succeeds!

### Phase 6: Repricing Loop (The Joke)
- [x] **6.1 Price Changed Screen**
  - "OOPS! The price has changed!" with shake animation
  - Shows old price (strikethrough) and new higher price
  - "Pay Again" button
  - "Rage Quit" option (still shows success 😈)
  - Loop counter showing attempt X of Y
  - Loops 2-5 times randomly with escalating prices

### Phase 7: Final Reward - Dancing Robot
- [x] **7.1 Victory Screen**
  - Fully animated CSS dancing robot with:
    - Moving arms and legs
    - Blinking eyes
    - Talking mouth animation
    - Heartbeat in chest
  - Continuous confetti particles effect
  - "SUBSCRIPTION COMPLETE!" message with glow
  - Stats: total paid, number of payments, time wasted
  - "Subscribe to Someone Else" restart button

---

## 📁 File Structure
```
/sensaihack
├── index.html          # Landing page ✅
├── styles.css          # Landing page styles ✅
├── script.js           # Landing page scripts ✅
├── demo.html           # Interactive demo app ✅
├── demo.css            # Demo app styles ✅
├── demo.js             # Demo app logic & state machine ✅
├── Instructions.md     # PRD ✅
└── TODO.md             # This file ✅
```

---

## 🚀 Future Enhancements (from PRD)
- [ ] Add multiple dancing robots
- [ ] Add voice lines / sound effects
- [ ] Add escalating absurd payment prompts
- [ ] Add social sharing screenshots

---

## ✨ Current Status: ALL CORE FEATURES COMPLETE!
