# Product Requirements Document (PRD)

## Product Name

**OnlyBots – Meta Quest 3 App**

## Overview

OnlyBots is a mixed-reality novelty application for Meta Quest 3 that uses passthrough camera capabilities to detect people in the user’s real-world environment and present a comedic, exaggerated subscription-based interaction loop. The app intentionally mimics a satirical version of subscription platforms by continuously changing pricing until the user reaches the final reward: a dancing NEO robot.

## Goal

Create an entertaining, absurd, and surprising interactive MR experience that feels playful, unexpected, and meme-like while showcasing passthrough, detection, UI overlays, and simple payment-like flows.

---

# 1. Core Features

## 1.1 Person Detection & Selection

* Use Meta Quest 3 passthrough camera to visualize the real environment.
* App identifies people (standing, sitting, walking) using basic outline or bounding-box detection.
* User can aim a cursor or use hand-tracking to select a detected person.
* Once selected, UI places a highlight around the person.

## 1.2 Subscription Prompt

After selecting a person, app displays a floating UI panel:

* Text: **“Would you like to subscribe to him/her?”**
* Two buttons: **Yes** / **No**

If "No": UI disappears and returns user to selection mode.
If "Yes": proceed to pricing.

## 1.3 Random Pricing Generator

When the user chooses "Yes":

* The app displays a random subscription price (e.g., $2.99, $14.99, $199.99).
* Button: **“Proceed to Pay”**

## 1.4 Dummy Payment Page

* Payment UI accepts any dummy card number, expiration, CVV, or fake input.
* Submission always succeeds.

## 1.5 Repricing Loop (Humor Feature)

After the payment succeeds:

* Show message: **“The price has changed!”**
* Present a new price that is:

  * Slightly higher
User must press **“Pay Again”**.

* This loop repeats ~2-4 times, randomly determined.

## 1.6 Final Reward Screen – Dancing NEO Robot

Once the final payment loop ends:

* A 3D animated NEO-style robot appears in MR space.
* Robot performs a short celebration dance.
* Background confetti particles.
* Text: **“Subscription Complete.”**

---

# 2. User Flow

1. **Open App → Passthrough activates**
2. System detects people in view
3. User selects a person
4. Prompt: "Subscribe?"
5. User presses Yes
6. Random price shown
7. Dummy payment page
8. Payment accepted
9. “Price has changed!” loop (3–7 cycles)
10. Dancing NEO robot animation
11. App resets to person-selection mode

---

# 3. Technical Requirements

## 3.1 Platform

* Meta Quest 3
* Built with Unity or Unreal (Unity recommended due to MR tooling)

## 3.2 MR / Passthrough

* Use Meta’s Passthrough API
* Person detection can be:

  * Basic body-outline ML (if supported)
  * Manual bounding box selection tool
  * Optional: face detection overlay

## 3.3 UI/UX

* Floating UI panels anchored in world space
* Hand tracking OR controller support

## 3.4 Dummy Payment System

* No real transaction processing
* Random price generator
* Local state machine to handle the repricing loop

## 3.5 3D Animation

* Import NEO robot model
* Simple looping dance animation
* Triggered at loop completion

---

# 4. Non-Goals

* No real monetary transactions
* No real user account system
* No real subscription infrastructure

---

# 5. Success Metrics

* App installs
* Average session time
* Number of completed repricing loops
* User reactions (humor-driven novelty)

---

# 6. Edge Cases & Errors

* No people detected → Show “No targets available”
* Lighting too low, detection fails → Show “Could not detect person, try again”
* User quits mid-loop → No refund needed since no real payments

---

# 7. Future Enhancements

* Add multiple dancing robots
* Add voice lines
* Add escalating absurd payment prompts
* Add social sharing screenshots

---

Make sure the landing page is modern. Cretae just the fonrt end ..not backend.. Do not use purple opink color..make it dark mode and professioanal..