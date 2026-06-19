# PrismID: Comprehensive Project Overview

## 1. Executive Summary
**PrismID** is a next-generation, AI-driven identity and trust lifecycle simulation platform. It is designed to demonstrate how modern security systems can continuously authenticate users in the background using behavioral heuristics, dynamic signal ingestion, and Zero-Knowledge Proofs (ZKP), without relying on static, high-friction authentication methods like traditional passwords.

---

## 2. Problem Statement
Traditional authentication relies heavily on static credentials (passwords, PINs) or binary one-time checks (MFA tokens). This paradigm presents several critical vulnerabilities and user experience flaws:
- **High Friction:** Users are constantly interrupted by CAPTCHAs, SMS codes, and forced logouts, degrading the user experience.
- **Session Hijacking:** Once authenticated, the session is often implicitly trusted. If a device is stolen or a session token is hijacked, the attacker has unrestricted access.
- **Data Privacy Risks:** Centralized databases storing raw biometric or behavioral data become massive honeypots for hackers.
- **The "Black Box" Problem:** Modern AI security systems often flag users or block transactions without providing clear, human-readable rationale, leading to locked accounts and frustrated support teams.

---

## 3. The PrismID Solution (Value Proposition)
PrismID solves these issues by shifting from **Static Authentication** to **Continuous Trust Scoring**. 

**How it helps:**
1. **Invisible Security:** Legitimate users experience zero friction. They are authenticated continuously in the background based on *how* they type, hold their device, and where they are located.
2. **Real-Time Threat Response:** The moment a session deviates from established behavioral baselines (e.g., sudden "impossible travel" or mechanical typing speeds), the system dynamically introduces friction (like a biometric challenge) or halts the session.
3. **Zero-Data Exposure:** By utilizing principles of Zero-Knowledge Proofs, the system validates that the user is who they claim to be without the server ever seeing or storing the raw telemetry data.
4. **Transparent Rationale:** Every security decision is explained via the Explainable AI (XAI) engine, explicitly detailing the mathematical weights that led to an account lock or challenge.

---

## 4. System Architecture

PrismID operates across a robust, multi-tiered architecture that securely transmits and analyzes telemetry data in real time.

### Tier 1: Client Interface (User Endpoint)
- **Data Sensors:** Constantly captures behavioral heuristics (e.g., Keystroke Cadence, Mouse Velocity) and device-level telemetry.
- **Local ZKP Hasher:** Cryptographically anonymizes all behavioral data *before* it leaves the user's device, ensuring strict privacy compliance.

### Tier 2: Edge Ingestion Layer
- **Telemetry API Gateway:** Receives the continuous stream of anonymized telemetry packets from the client interface.
- **Tamper-Proof Audit Ledger:** Immutably records every packet, score recalculation, and system event for forensic review and regulatory compliance.

### Tier 3: Explainable AI Risk Engine
- **Behavioral Pattern Matcher:** Compares the incoming data stream against established baseline models for the specific user.
- **Risk Heuristics Engine:** Calculates live threat vectors based on anomalies (e.g., datacenter IPs, impossibly fast typing).
- **XAI Rationale Generator:** Translates the raw algorithmic weights into human-readable data (Device Score, Network Score, Behavioral Score) to prevent "black box" lockouts.

### Tier 4: Dynamic Friction Controller (Output)
- Continuously adjusts the security posture of the session based on the AI's Trust Score output:
  - **Trust Score 85-100:** Grants frictionless access.
  - **Trust Score 40-84:** Triggers an active biometric challenge (e.g., Face Liveness Scan).
  - **Trust Score 0-39:** Immediately terminates the session.

---

## 5. Security & Trust Workflow

The typical lifecycle of a continuous authentication session in PrismID follows a strict algorithmic pathway:

**Phase 1: Observation & Ingestion**
1. The user begins interacting with the application normally.
2. The Client Interface collects telemetry (typing speed, geographic location, browser fingerprint).
3. The data is hashed locally and streamed securely to the Risk Engine.

**Phase 2: Analysis & Scoring**
4. The Risk Engine receives the telemetry stream and instantly compares it to the baseline.
5. The XAI Engine assigns a Trust Score from 0 to 100 based on the deviation.

**Phase 3: Automated Enforcement**
6. **Scenario A (Safe):** If the Trust Score remains above 85, the session is silently maintained. An event is logged to the Audit Ledger.
7. **Scenario B (Suspicious):** If the Trust Score drops (e.g., a sudden VPN activation), the Dynamic Friction Controller is invoked. The user is prompted to complete a fast Biometric Token exchange. If successful, trust is restored.
8. **Scenario C (Critical Threat):** If the Trust Score plummets due to severe anomalies (e.g., automated script injection), the session is immediately killed and a high-alert event is broadcasted.

---

## 6. Technology Stack

PrismID is built using modern, highly responsive frontend web technologies to simulate a real-time cybersecurity operations center.

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | React 18, TypeScript, Vite | Core application logic, strict type-safety, and blazing-fast HMR development. |
| **Styling** | Vanilla CSS (CSS Grid, Flexbox) | Custom "Glassmorphism" UI, dynamic neon glow variables, and `cubic-bezier` spring physics for premium tactical animations. |
| **3D Rendering** | Three.js, React Three Fiber, Drei | Renders the interactive "Trust Sphere" representing global network nodes and active threat vectors in real-time. |
| **Data Viz** | Recharts, Custom SVGs | Responsive bar charts for XAI breakdowns and active keystroke cadence tracking lines. |
| **Icons** | Lucide React | Clean, scalable vector icons used throughout the dashboard and landing page. |

---

## 7. How to Use PrismID (User Guide)

PrismID is divided into two primary views:

### The Landing Page (System Overview)
- **Purpose:** Acts as the marketing and technical overview of the platform.
- **Interaction:** Scroll through to read the core architectural pillars. You can interact with the **"Demo Interaction"** buttons to see how the 3D Sphere reacts to different threat levels globally.
- **Navigation:** Click the massive `Launch System Simulator` button or the `SECURITY SIMULATOR` tab in the header to enter the operations center.

### The Console Dashboard (Security Simulator)
- **Purpose:** Simulates a live Security Operations Center (SOC) dashboard.
- **Interaction:** 
  1. **Select a Threat Scenario:** On the right-hand panel, click between different scenarios (e.g., *Trusted Corporate Access*, *Account Takeover Attempt*, *Bot Network Attack*).
  2. **Observe the AI Engine:** Watch the center panel instantly recalculate the "Trust Score". Note how the dynamic background color changes (Green = Safe, Amber = Warning, Red = Critical).
  3. **Read the XAI Rationale:** Look at the bar charts in the center panel to see *exactly* why a score was lowered (e.g., network mismatch, impossible travel).
  4. **Review the Audit Ledger:** On the left-hand panel, watch the real-time, terminal-style log of events being immutably recorded as the scenario unfolds.
  5. **Watch the Keystroke Cadence:** Observe the real-time simulation of typing speeds at the bottom of the center column, showing the stark difference between human typing and robotic bot automation.

---

## 8. Future Enhancements
While currently a frontend simulation of advanced security concepts, the architecture is designed to accommodate:
1. **Live Backend Integration:** Connecting the simulation to a real Apache Kafka stream of telemetry data.
2. **Machine Learning Models:** Replacing the heuristics engine in `simulator.ts` with a real TensorFlow.js model trained on actual typing patterns.
3. **WebAuthn Integration:** Implementing real passkey and biometric hardware requests using the browser's native WebAuthn API for the step-up challenges.
