import React, { useState, useEffect, useRef } from 'react';

import { SCENARIOS, Scenario, calculateRisk, RiskResult } from '../utils/simulator';

import { TrustSphere3D } from './TrustSphere3D';



// SVG Icons for clean visuals

const DeviceIcon = () => (

  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>

);

const ShieldIcon = () => (

  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>

);

const NetworkIcon = () => (

  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path></svg>

);

const ActivityIcon = () => (

  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>

);

const LockIcon = () => (

  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>

);

const UserIcon = () => (

  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>

);



interface ConsoleDashboardProps {

  onRiskChange: (score: number, level: 'LOW' | 'MEDIUM' | 'HIGH') => void;

}



export const ConsoleDashboard: React.FC<ConsoleDashboardProps> = ({ onRiskChange }) => {

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('normal-customer');

  const [activeScenario, setActiveScenario] = useState<Scenario>(SCENARIOS[0]);

  const [riskResult, setRiskResult] = useState<RiskResult>(calculateRisk(SCENARIOS[0].signals));

  const [logs, setLogs] = useState<Array<{ time: string; message: string; type: 'info' | 'warn' | 'error' | 'success' }>>([]);

  

  // Dynamic animated risk score

  const [animatedScore, setAnimatedScore] = useState<number>(5);

  

  // Dynamic Risk History for the live scrolling line chart

  const [riskHistory, setRiskHistory] = useState<number[]>(Array(15).fill(5));

  

  // MFA step-up interactive simulation state

  const [showVerificationModal, setShowVerificationModal] = useState<boolean>(false);

  const [verificationType, setVerificationType] = useState<'MFA' | 'KYC' | 'NONE'>('NONE');

  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(false);

  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const [verificationProgress, setVerificationProgress] = useState<number>(0);

  const [verificationStatusText, setVerificationStatusText] = useState<string>('');



  // Keyboard simulator states (for user interactivity)

  const [userTypedText, setUserTypedText] = useState<string>('');

  const [customKeySpeeds, setCustomKeySpeeds] = useState<number[]>([]);

  const [lastKeyPressTime, setLastKeyPressTime] = useState<number>(0);

  const [interactiveDeviation, setInteractiveDeviation] = useState<number>(0.05);



  // Custom playground signal overrides

  const [customMouseJitter, setCustomMouseJitter] = useState<number>(0.10);

  const [customTypingDeviation, setCustomTypingDeviation] = useState<number>(0.10);

  const [customVelocity, setCustomVelocity] = useState<number>(0);

  const [customVpnDetected, setCustomVpnDetected] = useState<boolean>(false);

  const [customPrivilegedAccess, setCustomPrivilegedAccess] = useState<boolean>(false);

  const [customActionSensitivity, setCustomActionSensitivity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('LOW');

  const [customUnrecognizedDevice, setCustomUnrecognizedDevice] = useState<boolean>(false);



  // Live real client telemetry states

  const [realMouseJitter, setRealMouseJitter] = useState<number>(0.12);

  const [realIP, setRealIP] = useState<string>('127.0.0.1 (Detecting...)');

  const [realLocation, setRealLocation] = useState<string>('Detecting Location...');

  const [realOS, setRealOS] = useState<string>('Detecting OS...');

  const [realBrowser, setRealBrowser] = useState<string>('Detecting Browser...');

  const [realDeviceHash, setRealDeviceHash] = useState<string>('sha256:calculating...');



  // Webcam stream capture refs

  const videoRef = useRef<HTMLVideoElement>(null);

  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const [cameraPermissionError, setCameraPermissionError] = useState<boolean>(false);

  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);

  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');



  const canvasRef = useRef<HTMLCanvasElement>(null);

  const lastRiskLevelRef = useRef<string>(SCENARIOS[0].signals.actionSensitivity === 'LOW' ? 'LOW' : 'LOW');

  const lastActionRef = useRef<string>('ALLOW');



  // "" NEW: Toast notification state """"""""""""""""""""""""""""""""""""""""""

  type ToastType = 'info' | 'warn' | 'danger' | 'success';

  interface Toast {

    id: number;

    type: ToastType;

    title: string;

    message: string;

    exiting: boolean;

  }

  const [toasts, setToasts] = useState<Toast[]>([]);

  const toastIdRef = useRef(0);



  const pushToast = (type: ToastType, title: string, message: string) => {

    const id = ++toastIdRef.current;

    setToasts(prev => [...prev.slice(-3), { id, type, title, message, exiting: false }]);

    setTimeout(() => {

      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));

      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 380);

    }, 4200);

  };



  // "" NEW: Compliance Audit Log """""""""""""""""""""""""""""""""""""""""""""""

  interface AuditEntry {

    id: number;

    time: string;

    scenario: string;

    channel: string;

    score: number;

    level: string;

    action: string;

    compliance: string[];

  }

  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);

  const auditIdRef = useRef(0);





  // Capture real client telemetry on mount

  useEffect(() => {

    // 1. Detect OS

    const ua = navigator.userAgent;

    let localOS = 'Unknown OS';

    if (ua.indexOf('Win') !== -1) localOS = 'Windows 11 / 10';

    if (ua.indexOf('Mac') !== -1) localOS = 'macOS';

    if (ua.indexOf('Linux') !== -1) localOS = 'Linux OS';

    if (ua.indexOf('Android') !== -1) localOS = 'Android System';

    if (ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== -1) localOS = 'iOS Device';

    setRealOS(localOS);



    // 2. Detect Browser

    let localBrowser = 'Web Browser';

    if (ua.indexOf('Chrome') !== -1) localBrowser = 'Chrome';

    if (ua.indexOf('Safari') !== -1 && ua.indexOf('Chrome') === -1) localBrowser = 'Safari';

    if (ua.indexOf('Firefox') !== -1) localBrowser = 'Firefox';

    if (ua.indexOf('Edge') !== -1) localBrowser = 'Edge';

    setRealBrowser(localBrowser + ' ' + (navigator.language ? `(${navigator.language})` : ''));



    // 3. Canvas Fingerprinting Hash

    try {

      const canvas = document.createElement('canvas');

      const ctx = canvas.getContext('2d');

      if (ctx) {

        ctx.textBaseline = 'top';

        ctx.font = "14px 'Arial'";

        ctx.fillStyle = '#f60';

        ctx.fillRect(125, 1, 62, 20);

        ctx.fillStyle = '#069';

        ctx.fillText('PrismID, fingerprinting', 2, 17);

        const txt = canvas.toDataURL();

        let hash = 0;

        for (let i = 0; i < txt.length; i++) {

          hash = (hash << 5) - hash + txt.charCodeAt(i);

          hash |= 0;

        }

        setRealDeviceHash('sha256:' + Math.abs(hash).toString(16) + 'aa');

      }

    } catch {

      setRealDeviceHash('sha256:fingerprint_blocked');

    }



    // 4. Get Real IP and Location

    fetch('https://ipapi.co/json/')

      .then(res => res.json())

      .then(data => {

        if (data.ip) {

          setRealIP(`${data.ip} (Mapped: ${data.city}, ${data.country_name})`);

          setRealLocation(`${data.city}, ${data.country_name}`);

        }

      })

      .catch(() => {

        // Fallback if blocked

        setRealIP('122.161.45.12 (Mapped: Delhi, India - Local API proxy)');

        setRealLocation('Delhi, India');

      });

  }, []);



  // Capture real mouse jitter dynamically

  useEffect(() => {

    let lastX = 0;

    let lastY = 0;

    let lastTime = 0;

    const speeds: number[] = [];



    const handleMouseMove = (e: MouseEvent) => {

      const now = Date.now();

      if (lastTime > 0) {

        const dx = e.clientX - lastX;

        const dy = e.clientY - lastY;

        const dt = now - lastTime;

        if (dt > 0) {

          const speed = Math.sqrt(dx * dx + dy * dy) / dt;

          speeds.push(speed);

          if (speeds.length > 20) {

            speeds.shift();

            const avg = speeds.reduce((a, b) => a + b, 0) / speeds.length;

            const variance = speeds.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / speeds.length;

            // Map variance to a standard jitter coefficient percentage (0.05 to 0.35)

            const jitterVal = Math.min(0.95, Math.max(0.04, Math.sqrt(variance) * 0.08));

            setRealMouseJitter(jitterVal);

          }

        }

      }

      lastX = e.clientX;

      lastY = e.clientY;

      lastTime = now;

    };



    window.addEventListener('mousemove', handleMouseMove);

    return () => window.removeEventListener('mousemove', handleMouseMove);

  }, []);



  // Smoothly update scenario telemetry fields dynamically if "Normal Customer" or "Custom Playground" is active

  const getDynamicSignals = (): Scenario => {

    if (selectedScenarioId === 'normal-customer') {

      return {

        ...activeScenario,

        signals: {

          ...activeScenario.signals,

          os: realOS,

          browser: realBrowser,

          ipAddress: realIP,

          location: realLocation,

          deviceHash: realDeviceHash,

          mouseJitter: realMouseJitter,

          typingCadence: {

            ...activeScenario.signals.typingCadence,

            deviation: interactiveDeviation

          }

        },

        privacy: {

          ...activeScenario.privacy,

          hashedDeviceFingerprint: realDeviceHash.substring(0, 16) + '...',

          anonymizedIp: realIP.split(' ')[0].split('.').slice(0, 2).join('.') + '.X.X'

        }

      };

    } else if (selectedScenarioId === 'custom-playground') {

      const devHash = customUnrecognizedDevice ? 'e4da3b7fbc2c423820dcc509a6f7507e' : 'c4ca4238a0b923820dcc509a6f75849b';

      return {

        ...activeScenario,

        signals: {

          ...activeScenario.signals,

          deviceHash: devHash,

          vpnDetected: customVpnDetected,

          privilegedAccess: customPrivilegedAccess,

          actionSensitivity: customActionSensitivity,

          mouseJitter: customMouseJitter,

          velocityKmh: customVelocity,

          typingCadence: {

            ...activeScenario.signals.typingCadence,

            deviation: customTypingDeviation

          }

        },

        privacy: {

          ...activeScenario.privacy,

          hashedDeviceFingerprint: devHash.substring(0, 16) + '...',

          anonymizedIp: customVpnDetected ? '185.220.X.X' : '127.0.0.X'

        }

      };

    }

    return activeScenario;

  };



  const dynamicScenario = getDynamicSignals();



  // Keep Risk Engine calculations updated live based on dynamic signals

  useEffect(() => {

    if (verificationSuccess) {

      return;

    }

    const result = calculateRisk(dynamicScenario.signals);

    setRiskResult(result);

    onRiskChange(result.score, result.level);



    // Add log if level or action changed

    if (result.level !== lastRiskLevelRef.current || result.recommendedAction !== lastActionRef.current) {

      const logMsg = {

        time: new Date().toLocaleTimeString(),

        message: `Risk level shifted to ${result.level} (${result.score}%). Recommended action: ${result.recommendedAction}.`,

        type: result.level === 'HIGH' ? ('error' as const) : result.level === 'MEDIUM' ? ('warn' as const) : ('success' as const)

      };

      setLogs(prev => [logMsg, ...prev].slice(0, 30));

      lastRiskLevelRef.current = result.level;

      lastActionRef.current = result.recommendedAction;

      

      // Update history graph with new base score

      setRiskHistory(prev => [...prev.slice(1), result.score]);

    }

  }, [

    selectedScenarioId,

    activeScenario,

    realOS,

    realBrowser,

    realIP,

    realLocation,

    realDeviceHash,

    realMouseJitter,

    interactiveDeviation,

    verificationSuccess,

    customMouseJitter,

    customTypingDeviation,

    customVelocity,

    customVpnDetected,

    customPrivilegedAccess,

    customActionSensitivity,

    customUnrecognizedDevice

  ]);



  // Interpolate/Animate Risk Score smoothly

  useEffect(() => {

    let animationFrame: number;

    const target = riskResult.score;

    

    const updateScore = () => {

      setAnimatedScore(prev => {

        if (prev === target) return prev;

        const diff = target - prev;

        const step = diff > 0 ? Math.ceil(diff * 0.15) : Math.floor(diff * 0.15);

        const next = prev + step;

        

        if (Math.abs(next - target) < 1) {

          return target;

        }

        return next;

      });

      animationFrame = requestAnimationFrame(updateScore);

    };

    

    animationFrame = requestAnimationFrame(updateScore);

    return () => cancelAnimationFrame(animationFrame);

  }, [riskResult.score]);



  // 1. Enumerate available video input devices when the KYC modal opens

  useEffect(() => {

    if (showVerificationModal && verificationType === 'KYC') {

      navigator.mediaDevices.enumerateDevices()

        .then(devices => {

          const videoInputs = devices.filter(d => d.kind === 'videoinput');

          setVideoDevices(videoInputs);

          if (videoInputs.length > 0 && !selectedDeviceId) {

            // Find an integrated webcam or USB camera first, otherwise take the first device

            const preferred = videoInputs.find(d => 

              d.label.toLowerCase().includes('integrated') || 

              d.label.toLowerCase().includes('webcam') || 

              d.label.toLowerCase().includes('front') || 

              d.label.toLowerCase().includes('usb')

            );

            setSelectedDeviceId(preferred ? preferred.deviceId : videoInputs[0].deviceId);

          }

        })

        .catch(err => {

          console.warn('Error enumerating video input devices:', err);

        });

    }

  }, [showVerificationModal, verificationType]);



  // 2. Request/Release Webcam Stream using the selected device

  useEffect(() => {

    let activeStream: MediaStream | null = null;



    if (showVerificationModal && verificationType === 'KYC') {

      setCameraPermissionError(false);

      

      const constraints = selectedDeviceId 

        ? { video: { deviceId: { exact: selectedDeviceId }, width: { ideal: 640 }, height: { ideal: 480 } } }

        : { video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } };



      navigator.mediaDevices.getUserMedia(constraints)

        .then(stream => {

          activeStream = stream;

          setCameraStream(stream);

        })

        .catch(err => {

          console.warn('Camera access denied or unavailable', err);

          setCameraPermissionError(true);

        });

    }



    return () => {

      if (activeStream) {

        activeStream.getTracks().forEach(track => track.stop());

      }

      setCameraStream(null);

    };

  }, [showVerificationModal, verificationType, selectedDeviceId]);



  // 3. Sync video element srcObject when cameraStream becomes active

  useEffect(() => {

    if (videoRef.current) {

      videoRef.current.srcObject = cameraStream;

    }

  }, [cameraStream]);



  // Handle Scenario Switch

  const handleScenarioChange = (scenarioId: string) => {

    const scenario = SCENARIOS.find(s => s.id === scenarioId);

    if (!scenario) return;

    

    setSelectedScenarioId(scenarioId);

    setActiveScenario(scenario);

    

    // Calculate risk based on scenario signals

    let targetSignals = scenario.signals;

    if (scenarioId === 'normal-customer') {

      targetSignals = {

        ...scenario.signals,

        os: realOS,

        browser: realBrowser,

        ipAddress: realIP,

        location: realLocation,

        deviceHash: realDeviceHash,

        mouseJitter: realMouseJitter

      };

    }



    const result = calculateRisk(targetSignals);

    setRiskResult(result);

    onRiskChange(result.score, result.level);

    

    // Update refs to prevent duplicate log shift triggers

    lastRiskLevelRef.current = result.level;

    lastActionRef.current = result.recommendedAction;

    

    // Add logs

    const newLog = {

      time: new Date().toLocaleTimeString(),

      message: `Channel profile changed: [${scenario.channel}] - Scenario: ${scenario.name}`,

      type: 'info' as const

    };

    const alertLog = {

      time: new Date().toLocaleTimeString(),

      message: `Risk engine completed calculations. Dynamic score: ${result.score}%. Recommended enforcement: ${result.recommendedAction}`,

      type: result.level === 'HIGH' ? 'error' as const : result.level === 'MEDIUM' ? 'warn' as const : 'success' as const

    };

    

    setLogs(prev => [newLog, alertLog, ...prev].slice(0, 30));

    setVerificationSuccess(false);

    setVerificationProgress(0);

    

    setRiskHistory(prev => [...prev.slice(1), result.score]);



    // NEW: Push toast notification

    const toastType = result.level === 'HIGH' ? 'danger' : result.level === 'MEDIUM' ? 'warn' : 'success';

    const toastTitle = result.level === 'HIGH'

      ? 'Critical Threat Detected'

      : result.level === 'MEDIUM'

        ? 'Elevated Risk -- Action Required'

        : 'Session Trust Verified';

    const toastMsg = `[${scenario.channel}] Score: ${result.score}% . ${result.recommendedAction.replace(/_/g, ' ')}`;

    pushToast(toastType, toastTitle, toastMsg);



    // NEW: Append to Compliance Audit Log

    const complianceTags = ['RBI CIR 2024-01'];

    if (result.level !== 'LOW') complianceTags.push('DPDP Act 2023 S.8');

    if (result.score >= 70)     complianceTags.push('ISO 27001 A.12.4');

    if (scenario.signals.privilegedAccess) complianceTags.push('PCI-DSS 10.2');

    const newAudit: AuditEntry = {

      id: ++auditIdRef.current,

      time: new Date().toLocaleTimeString(),

      scenario: scenario.name,

      channel: scenario.channel,

      score: result.score,

      level: result.level,

      action: result.recommendedAction,

      compliance: complianceTags

    };

    setAuditLog(prev => [newAudit, ...prev].slice(0, 20));

    

    if (result.recommendedAction === 'MFA_CHALLENGE') {

      setVerificationType('MFA');

      setShowVerificationModal(true);

    } else if (result.recommendedAction === 'KYC_VERIFICATION') {

      setVerificationType('KYC');

      setShowVerificationModal(true);

    } else {

      setVerificationType('NONE');

      setShowVerificationModal(false);

    }

  };





  // Update scrolling line chart over time

  useEffect(() => {

    const interval = setInterval(() => {

      setRiskHistory(prev => {

        const lastVal = prev[prev.length - 1];

        const noise = (Math.random() - 0.5) * 4;

        let newVal = lastVal + noise;

        

        if (riskResult.level === 'LOW') {

          newVal = Math.max(2, Math.min(15, newVal));

        } else if (riskResult.level === 'MEDIUM') {

          newVal = Math.max(30, Math.min(65, newVal));

        } else {

          newVal = Math.max(75, Math.min(98, newVal));

        }

        

        return [...prev.slice(1), Math.round(newVal)];

      });

    }, 1200);



    return () => clearInterval(interval);

  }, [riskResult.level]);



  // Draw Line Chart on Canvas

  useEffect(() => {

    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (!ctx) return;



    const width = canvas.width;

    const height = canvas.height;

    

    ctx.clearRect(0, 0, width, height);



    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';

    ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {

      const y = (height / 4) * i;

      ctx.beginPath();

      ctx.moveTo(0, y);

      ctx.lineTo(width, y);

      ctx.stroke();

    }



    const pointsCount = riskHistory.length;

    const step = width / (pointsCount - 1);

    

    ctx.beginPath();

    ctx.moveTo(0, height);



    const strokeGrad = ctx.createLinearGradient(0, 0, width, 0);

    const fillGrad = ctx.createLinearGradient(0, 0, 0, height);

    

    let chartColor = '#00f2fe';

    if (riskResult.level === 'MEDIUM') chartColor = '#f59e0b';

    if (riskResult.level === 'HIGH') chartColor = '#ef4444';



    strokeGrad.addColorStop(0, 'rgba(0, 242, 254, 0.2)');

    strokeGrad.addColorStop(0.5, chartColor);

    strokeGrad.addColorStop(1, chartColor);



    fillGrad.addColorStop(0, `${chartColor}22`);

    fillGrad.addColorStop(1, 'rgba(0,0,0,0)');



    ctx.beginPath();

    riskHistory.forEach((val, idx) => {

      const x = idx * step;

      const y = height - (val / 100) * (height - 10);

      if (idx === 0) {

        ctx.moveTo(x, y);

      } else {

        ctx.lineTo(x, y);

      }

    });



    ctx.strokeStyle = strokeGrad;

    ctx.lineWidth = 3;

    ctx.stroke();



    ctx.lineTo((pointsCount - 1) * step, height);

    ctx.lineTo(0, height);

    ctx.closePath();

    ctx.fillStyle = fillGrad;

    ctx.fill();



    const lastX = (pointsCount - 1) * step;

    const lastY = height - (riskHistory[pointsCount - 1] / 100) * (height - 10);

    ctx.beginPath();

    ctx.arc(lastX - 2, lastY, 5, 0, Math.PI * 2);

    ctx.fillStyle = chartColor;

    ctx.shadowBlur = 10;

    ctx.shadowColor = chartColor;

    ctx.fill();

    ctx.shadowBlur = 0;

  }, [riskHistory, riskResult.level]);



  // Trigger real device hardware biometric prompt (Touch ID, Windows Hello, Face ID, Pixel Imprint)

  const triggerRealBiometricPrompt = async (): Promise<boolean> => {

    if (!window.PublicKeyCredential) {

      console.warn("WebAuthn is not supported on this browser.");

      return false;

    }

    

    try {

      const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();

      if (!isAvailable) {

        console.warn("Platform biometric user verification is not available on this device.");

        return false;

      }



      const challenge = new Uint8Array(32);

      window.crypto.getRandomValues(challenge);

      const userId = new Uint8Array(16);

      window.crypto.getRandomValues(userId);



      // Trigger native OS biometric request dialog

      const credential = await navigator.credentials.create({

        publicKey: {

          challenge: challenge,

          rp: {

            name: "PrismID Security Console",

            id: window.location.hostname

          },

          user: {

            id: userId,

            name: "sandbox@prismid.io",

            displayName: "PrismID Sandbox Session"

          },

          pubKeyCredParams: [

            { type: "public-key", alg: -7 },   // ES256 (P-256)

            { type: "public-key", alg: -257 }  // RS256

          ],

          authenticatorSelection: {

            userVerification: "required",      // Force biometric check

            authenticatorAttachment: "platform" // Force built-in platform sensor (TouchID / Windows Hello)

          },

          timeout: 30000,

          attestation: "none"

        }

      });



      return !!credential;

    } catch (err) {

      console.error("Hardware biometric verification error:", err);

      throw err;

    }

  };



  // Handle simulation verification success with gradual progress increments

  const handleSimulateVerification = async () => {

    setIsVerifying(true);

    setVerificationProgress(0);



    let biometricSuccess = false;



    // Only trigger real system biometric (WebAuthn/Passkey FIDO2) if it is MFA type!

    if (verificationType === 'MFA') {

      setVerificationStatusText("Awaiting hardware platform authentication...");

      try {

        // Trigger the real system biometric challenge (fingerprint/Face ID)

        biometricSuccess = await triggerRealBiometricPrompt();

        if (biometricSuccess) {

          const hardwareSuccessLog = {

            time: new Date().toLocaleTimeString(),

            message: `[MFA/Biometric] Hardware Authenticator Verified (TouchID/Windows Hello/FaceID success).`,

            type: 'success' as const

          };

          setLogs(prev => [hardwareSuccessLog, ...prev].slice(0, 30));

        } else {

          const skipLog = {

            time: new Date().toLocaleTimeString(),

            message: `[MFA/Biometric] Platform biometric hardware unavailable. Falling back to simulator.`,

            type: 'warn' as const

          };

          setLogs(prev => [skipLog, ...prev].slice(0, 30));

        }

      } catch (err) {

        // User cancelled, or other prompt error

        const errLog = {

          time: new Date().toLocaleTimeString(),

          message: `[MFA/Biometric] Hardware challenge verification skipped or cancelled by user.`,

          type: 'warn' as const

        };

        setLogs(prev => [errLog, ...prev].slice(0, 30));

      }

    } else {

      // For KYC (Webcam check), do NOT trigger the WebAuthn passkey prompt!

      setVerificationStatusText("Accessing camera and verifying liveness stream...");

    }



    // 2. Perform the graphical visualization sequence (explaining the encryption process)

    const mfaStages = [

      { progress: 15, text: 'Accessing Secure Enclave API...' },

      { progress: 40, text: 'Acquiring hardware cryptographic key...' },

      { progress: 70, text: 'Validating signature credentials...' },

      { progress: 90, text: 'Generating Zero-Knowledge cryptographic verification proof...' },

      { progress: 100, text: 'Identity verified. Handshake completed.' }

    ];



    const kycStages = [

      { progress: 15, text: 'Calibrating face mesh alignment...' },

      { progress: 35, text: 'Locking facial node coordinates...' },

      { progress: 60, text: 'Measuring pupil distance and symmetry...' },

      { progress: 85, text: 'Analyzing optical liveness flow...' },

      { progress: 100, text: 'Liveness confirmed. Identity verified.' }

    ];



    const stages = verificationType === 'MFA' ? mfaStages : kycStages;

    let currentStageIdx = 0;



    const interval = setInterval(() => {

      if (currentStageIdx < stages.length) {

        const stage = stages[currentStageIdx];

        setVerificationProgress(stage.progress);

        setVerificationStatusText(stage.text);

        currentStageIdx++;

      } else {

        clearInterval(interval);

        setIsVerifying(false);

        setVerificationSuccess(true);

        

        const overriddenResult: RiskResult = {

          ...riskResult,

          score: 5,

          level: 'LOW',

          recommendedAction: 'ALLOW',

          triggeredSignals: [`${verificationType} Biometric Verified`, 'Risk Vector Cleared']

        };

        

        setRiskResult(overriddenResult);

        onRiskChange(overriddenResult.score, overriddenResult.level);

        

        const successLog = {

          time: new Date().toLocaleTimeString(),

          message: `${verificationType === 'MFA' ? 'FIDO2 Passkey / WebAuthn' : 'KYC Liveness Biometric'} verification completed. Session cleared.`,

          type: 'success' as const

        };

        setLogs(prev => [successLog, ...prev]);

        setRiskHistory(prev => [...prev.slice(1), 5]);



        setTimeout(() => {

          setShowVerificationModal(false);

          if (cameraStream) {

            cameraStream.getTracks().forEach(track => track.stop());

            setCameraStream(null);

          }

        }, 1500);

      }

    }, 900);

  };



  // Keyboard typing cadence simulator

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {

    const text = e.target.value;

    setUserTypedText(text);



    const now = Date.now();

    if (lastKeyPressTime > 0) {

      const flightTime = now - lastKeyPressTime;

      setCustomKeySpeeds(prev => [...prev.slice(-15), flightTime]);

      

      const sum = customKeySpeeds.reduce((a, b) => a + b, 0);

      const avg = customKeySpeeds.length ? sum / customKeySpeeds.length : 100;

      

      const variance = customKeySpeeds.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / (customKeySpeeds.length || 1);

      const devScore = Math.min(1.0, Math.sqrt(variance) / 120);

      setInteractiveDeviation(devScore);



      if (text.length > 5 && devScore > 0.6) {

        const typingLog = {

          time: new Date().toLocaleTimeString(),

          message: `Live typing dynamics deviation detected: ${Math.round(devScore * 100)}% variance.`,

          type: 'warn' as const

        };

        setLogs(prev => [typingLog, ...prev].slice(0, 30));

      }

    }

    setLastKeyPressTime(now);

  };



  const getRiskColor = (level: string) => {

    if (level === 'LOW') return 'var(--color-secure)';

    if (level === 'MEDIUM') return 'var(--color-warning)';

    return 'var(--color-danger)';

  };



  const renderProgressSection = () => (

    <div style={{ marginBottom: '20px', width: '100%' }}>

      <div style={{

        fontSize: '14px',

        color: 'var(--text-muted)',

        fontFamily: 'var(--font-mono)',

        marginBottom: '8px',

        textAlign: 'left'

      }}>

        {verificationStatusText}

      </div>

      <div style={{

        width: '100%',

        height: '6px',

        background: 'rgba(255, 255, 255, 0.03)',

        borderRadius: '3px',

        overflow: 'hidden',

        border: '1px solid rgba(255, 255, 255, 0.05)'

      }}>

        <div style={{

          width: `${verificationProgress}%`,

          height: '100%',

          background: `linear-gradient(90deg, ${verificationType === 'MFA' ? 'var(--color-primary), var(--color-accent)' : 'var(--color-warning), #d97706'})`,

          borderRadius: '3px',

          transition: 'width 0.8s ease-in-out',

          boxShadow: verificationType === 'MFA' ? 'var(--glow-cyan)' : 'var(--glow-warning)'

        }} />

      </div>

      <div style={{

        fontSize: '16px',

        color: 'var(--text-dark)',

        fontFamily: 'var(--font-mono)',

        marginTop: '4px',

        textAlign: 'right'

      }}>

        {verificationProgress}%

      </div>

    </div>

  );



  const renderActionButtons = () => (

    !verificationSuccess ? (

      <button

        onClick={handleSimulateVerification}

        disabled={isVerifying}

        className="cyber-button active"

        style={{

          width: '100%',

          justifyContent: 'center',

          padding: '16px',

          fontWeight: 600,

          fontSize: '16px'

        }}

      >

        {isVerifying ? (

          <span>Authenticating secure metrics...</span>

        ) : (

          <span>Verify Identity Verification</span>

        )}

      </button>

    ) : (

      <div style={{

        background: 'rgba(16, 185, 129, 0.1)',

        border: '1.5px solid var(--color-secure)',

        borderRadius: '10px',

        padding: '16px',

        color: 'var(--color-secure)',

        fontWeight: 600,

        fontSize: '14px',

        display: 'flex',

        alignItems: 'center',

        justifyContent: 'center',

        gap: '20px',

        boxShadow: 'var(--glow-secure)',

        width: '100%'

      }}>

        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-secure)' }}></span>

        Verification Complete. Trust Restored.

      </div>

    )

  );



  return (

    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>



      {/* "" NEW: Toast Notification Overlay (fixed position, non-blocking) "" */}

      <div className="toast-container">

        {toasts.map(toast => (

          <div key={toast.id} className={`toast-item toast-${toast.type} ${toast.exiting ? 'toast-exit' : 'toast-enter'}`}>

            <div className={`toast-icon ${toast.type}`}>

              {toast.type === 'danger'  && '!'}

              {toast.type === 'warn'    && '!!'}

              {toast.type === 'success' && 'v'}

              {toast.type === 'info'    && 'i'}

            </div>

            <div style={{ flex: 1 }}>

              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '3px' }}>

                {toast.title}

              </div>

              <div style={{ fontSize: '16px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', lineHeight: '1.4' }}>

                {toast.message}

              </div>

            </div>

            <button

              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}

              style={{ background: 'none', border: 'none', color: 'var(--text-dark)', cursor: 'pointer', fontSize: '14px', padding: '0', lineHeight: 1, flexShrink: 0 }}

            >x</button>

          </div>

        ))}

      </div>

      

      {/* Dynamic Security Alert Banner at Top */}

      <div className={`glass-panel ${riskResult.level === 'HIGH' ? 'glow-danger alert-banner-active' : riskResult.level === 'MEDIUM' ? 'glow-warning' : 'glow-secure'}`} style={{

        padding: '16px 24px',

        display: 'flex',

        alignItems: 'center',

        justifyContent: 'space-between',

        transition: 'var(--transition-smooth)'

      }}>



        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>

          <span className={`status-dot ${riskResult.level === 'LOW' ? 'secure' : riskResult.level === 'MEDIUM' ? 'warning' : 'danger'}`}></span>

          <div>

            <div style={{

              fontFamily: 'var(--font-mono)',

              fontSize: '16px',

              color: getRiskColor(riskResult.level),

              fontWeight: 'bold',

              letterSpacing: '0.08em'

            }}>

              {riskResult.level === 'LOW' ? 'PRISM ID: SESSION SECURE' : riskResult.level === 'MEDIUM' ? 'WARNING: ELEVATED ANOMALY' : 'CRITICAL SYSTEM ALARM'}

            </div>

            <div style={{ fontSize: '16px', fontWeight: 600, marginTop: '2px', color: 'var(--text-main)' }}>

              {riskResult.level === 'LOW' && 'Access Granted Seamlessly. Active Telemetry OK.'}

              {riskResult.level === 'MEDIUM' && 'MFA Challenge Pending. Session Execution Halted.'}

              {riskResult.level === 'HIGH' && 'ANOMALOUS THREAT ACTIVE. SECURITY SHIELD DEPLOYED.'}

            </div>

          </div>

        </div>

        <div style={{

          fontFamily: 'var(--font-mono)',

          fontSize: '14px',

          fontWeight: 'bold',

          color: getRiskColor(riskResult.level),

          background: 'rgba(0,0,0,0.3)',

          padding: '6px 14px',

          borderRadius: '6px',

          border: `1px solid rgba(${riskResult.level === 'LOW' ? '16, 185, 129' : riskResult.level === 'MEDIUM' ? '245, 158, 11' : '239, 68, 68'}, 0.2)`

        }}>

          SCORE: {animatedScore}%

        </div>

      </div>



      {/* Dynamic Scenario selector */}

      <div className="glass-panel" style={{ padding: '32px' }}>

        <h3 style={{ marginBottom: '14px', fontSize: '24px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '16px' }}>

          <ShieldIcon /> Threat Simulation Scenarios

        </h3>

        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5' }}>

          Select a predefined scenario to run telemetry data through the Continuous Risk Engine. See how PrismID behaves across different channels and access patterns.

        </p>

        

        <div style={{

          display: 'grid',

          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',

          gap: '14px'

        }}>

          {SCENARIOS.map(sc => {

            const scResult = calculateRisk(sc.signals);

            const isActive = selectedScenarioId === sc.id;

            return (

              <button

                key={sc.id}

                onClick={() => handleScenarioChange(sc.id)}

                className="cyber-button"

                style={{

                  textAlign: 'left',

                  padding: '16px',

                  height: '100%',

                  display: 'flex',

                  flexDirection: 'column',

                  alignItems: 'flex-start',

                  gap: '6px',

                  position: 'relative',

                  overflow: 'hidden',

                  background: isActive ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.01)',

                  borderColor: isActive ? getRiskColor(scResult.level) : 'var(--border-color)',

                  boxShadow: isActive ? `0 0 15px rgba(${scResult.level === 'LOW' ? '16, 185, 129' : scResult.level === 'MEDIUM' ? '245, 158, 11' : '239, 68, 68'}, 0.25)` : 'none'

                }}

              >

                {isActive && (

                  <div style={{

                    position: 'absolute',

                    top: 0,

                    left: 0,

                    height: '100%',

                    width: '4px',

                    backgroundColor: getRiskColor(scResult.level)

                  }} />

                )}

                <span style={{ fontWeight: 600, fontSize: '14px', color: isActive ? 'var(--text-main)' : 'var(--text-muted)' }}>{sc.name}</span>

                <span style={{ fontSize: '16px', color: isActive ? getRiskColor(scResult.level) : 'var(--text-dark)', fontFamily: 'var(--font-mono)' }}>

                  Channel: {sc.channel}

                </span>

              </button>

            );

          })}

        </div>

        

        {/* Active Scenario Info Box */}

        <div style={{

          marginTop: '20px',

          padding: '16px',

          background: 'rgba(255, 255, 255, 0.015)',

          borderRadius: '10px',

          borderLeft: `4px solid ${getRiskColor(riskResult.level)}`,

          border: '1px solid rgba(255,255,255,0.03)',

          borderLeftWidth: '4px'

        }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>

            <span style={{ fontWeight: 600, fontSize: '16px', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>PROFILE SUMMARY</span>

            <span style={{

              fontFamily: 'var(--font-mono)',

              fontSize: '16px',

              color: getRiskColor(riskResult.level),

              background: `rgba(${riskResult.level === 'LOW' ? '16, 185, 129' : riskResult.level === 'MEDIUM' ? '245, 158, 11' : '239, 68, 68'}, 0.1)`,

              padding: '2px 8px',

              borderRadius: '4px',

              border: `1px solid rgba(${riskResult.level === 'LOW' ? '16, 185, 129' : riskResult.level === 'MEDIUM' ? '245, 158, 11' : '239, 68, 68'}, 0.15)`

            }}>

              CHANNEL: {activeScenario.channel}

            </span>

          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: '1.6' }}>

            {activeScenario.description}

          </p>

        </div>



        {/* Custom Playground Control Sliders */}

        {selectedScenarioId === 'custom-playground' && (

          <div style={{

            marginTop: '20px',

            padding: '28px',

            background: 'rgba(255, 255, 255, 0.015)',

            borderRadius: '10px',

            border: '1px dashed rgba(255, 255, 255, 0.08)',

            display: 'flex',

            flexDirection: 'column',

            gap: '16px'

          }}>

            <h4 style={{ fontSize: '13.5px', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', margin: 0 }}>

                CUSTOM INGRESS CONTROL PANEL

            </h4>

            <div style={{

              display: 'grid',

              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',

              gap: '20px'

            }}>

              {/* Slider 1: Mouse Jitter */}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', color: 'var(--text-muted)' }}>

                  <span>Mouse Jitter Override</span>

                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>{Math.round(customMouseJitter * 100)}%</span>

                </div>

                <input

                  type="range"

                  min="0.01"

                  max="0.99"

                  step="0.01"

                  value={customMouseJitter}

                  onChange={(e) => setCustomMouseJitter(parseFloat(e.target.value))}

                  style={{ width: '100%', accentColor: 'var(--color-primary)', background: 'rgba(255,255,255,0.05)' }}

                />

              </div>



              {/* Slider 2: Typing Deviation */}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', color: 'var(--text-muted)' }}>

                  <span>Keystroke Cadence Deviation</span>

                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>{Math.round(customTypingDeviation * 100)}%</span>

                </div>

                <input

                  type="range"

                  min="0.01"

                  max="0.99"

                  step="0.01"

                  value={customTypingDeviation}

                  onChange={(e) => setCustomTypingDeviation(parseFloat(e.target.value))}

                  style={{ width: '100%', accentColor: 'var(--color-accent)', background: 'rgba(255,255,255,0.05)' }}

                />

              </div>



              {/* Slider 3: Velocity */}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', color: 'var(--text-muted)' }}>

                  <span>Impossible Geo-Velocity</span>

                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-danger)' }}>{customVelocity} km/h</span>

                </div>

                <input

                  type="range"

                  min="0"

                  max="1200"

                  step="50"

                  value={customVelocity}

                  onChange={(e) => setCustomVelocity(parseInt(e.target.value))}

                  style={{ width: '100%', accentColor: 'var(--color-danger)', background: 'rgba(255,255,255,0.05)' }}

                />

              </div>



              {/* Toggle 1: VPN / Proxy */}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>

                <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>VPN/Proxy Connection</span>

                <button

                  onClick={() => setCustomVpnDetected(prev => !prev)}

                  className="cyber-button"

                  style={{

                    padding: '6px 14px',

                    fontSize: '16px',

                    borderColor: customVpnDetected ? 'var(--color-warning)' : 'var(--border-color)',

                    color: customVpnDetected ? 'var(--color-warning)' : 'var(--text-muted)'

                  }}

                >

                  {customVpnDetected ? 'ACTIVE' : 'INACTIVE'}

                </button>

              </div>



              {/* Toggle 2: Privileged Access */}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>

                <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>Privileged Console</span>

                <button

                  onClick={() => setCustomPrivilegedAccess(prev => !prev)}

                  className="cyber-button"

                  style={{

                    padding: '6px 14px',

                    fontSize: '16px',

                    borderColor: customPrivilegedAccess ? 'var(--color-danger)' : 'var(--border-color)',

                    color: customPrivilegedAccess ? 'var(--color-danger)' : 'var(--text-muted)'

                  }}

                >

                  {customPrivilegedAccess ? 'ADMIN' : 'USER'}

                </button>

              </div>



              {/* Toggle 3: Unrecognized Device */}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>

                <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>Fingerprint Baseline</span>

                <button

                  onClick={() => setCustomUnrecognizedDevice(prev => !prev)}

                  className="cyber-button"

                  style={{

                    padding: '6px 14px',

                    fontSize: '16px',

                    borderColor: customUnrecognizedDevice ? 'var(--color-warning)' : 'var(--border-color)',

                    color: customUnrecognizedDevice ? 'var(--color-warning)' : 'var(--text-muted)'

                  }}

                >

                  {customUnrecognizedDevice ? 'NEW DEVICE' : 'KNOWN BASELINE'}

                </button>

              </div>



              {/* Dropdown: Action Sensitivity */}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>

                <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>Transaction Sensitivity</span>

                <select

                  value={customActionSensitivity}

                  onChange={(e) => setCustomActionSensitivity(e.target.value as any)}

                  style={{

                    background: 'rgba(0,0,0,0.4)',

                    color: 'var(--text-main)',

                    border: '1px solid var(--border-color)',

                    borderRadius: '6px',

                    padding: '8px 10px',

                    fontSize: '16px',

                    outline: 'none'

                  }}

                >

                  <option value="LOW">LOW (Browse Balance)</option>

                  <option value="MEDIUM">MEDIUM (Small Transfer)</option>

                  <option value="HIGH">HIGH (Add Recipient)</option>

                  <option value="CRITICAL">CRITICAL (System Export)</option>

                </select>

              </div>



            </div>

          </div>

        )}

      </div>



      {/* 

          MAIN DASHBOARD GRID " Equal 4-4-4 Columns, Full Usage

           */}

      <div className="dashboard-grid">



        {/* """"""" LEFT COLUMN (span 4) """"""" */}

        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '20px' }}>



          {/* Trust Sphere */}

          <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

              <div style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>

                LIVE IDENTITY TRUST SPHERE

              </div>

              <span className={`status-dot ${riskResult.level === 'LOW' ? 'secure' : riskResult.level === 'MEDIUM' ? 'warning' : 'danger'}`} />

            </div>

            <div style={{ width: '100%', height: '300px', background: 'rgba(0,0,0,0.35)', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.04)' }}>

              <TrustSphere3D riskScore={riskResult.score} riskLevel={riskResult.level} />

            </div>

            {/* Legend cards */}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>

              {[

                { dot: 'secure',  label: 'LOW',    desc: 'Seamless' },

                { dot: 'warning', label: 'MEDIUM', desc: 'MFA Prompt' },

                { dot: 'danger',  label: 'HIGH',   desc: 'Blocked' }

              ].map(item => (

                <div key={item.label} style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)', textAlign: 'center' }}>

                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>

                    <span className={`status-dot ${item.dot}`} />

                  </div>

                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{item.label}</div>

                  <div style={{ fontSize: '14px', color: 'var(--text-dark)', marginTop: '2px' }}>{item.desc}</div>

                </div>

              ))}

            </div>

          </div>



          {/* Live Event Ledger */}

          <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', flex: 1, minHeight: '280px' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>

              <h4 style={{ fontSize: '22px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '20px' }}>

                <LockIcon /> Event Audit Ledger

              </h4>

              <span style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--color-secure)', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)' }}>

                TAMPER-PROOF

              </span>

            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '7px' }}>

              {logs.length === 0 ? (

                <div style={{ color: 'var(--text-dark)', fontSize: '16px', fontFamily: 'var(--font-mono)', padding: '28px', textAlign: 'center' }}>

                  No events yet. Select a scenario.

                </div>

              ) : logs.map((log, index) => (

                <div key={index} style={{

                  borderRadius: '8px',

                  padding: '8px 12px',

                  background: log.type === 'error' ? 'rgba(239,68,68,0.05)' : log.type === 'warn' ? 'rgba(245,158,11,0.05)' : log.type === 'success' ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)',

                  border: `1px solid ${log.type === 'error' ? 'rgba(239,68,68,0.12)' : log.type === 'warn' ? 'rgba(245,158,11,0.1)' : log.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)'}`,

                  lineHeight: '1.5'

                }}>

                  <div style={{ fontSize: '14px', color: 'var(--text-dark)', fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>{log.time}</div>

                  <div style={{ fontSize: '14px', color: log.type === 'error' ? 'var(--color-danger)' : log.type === 'warn' ? 'var(--color-warning)' : log.type === 'success' ? 'var(--color-secure)' : 'var(--text-muted)' }}>

                    {log.message}

                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>



        {/* """"""" MIDDLE COLUMN (span 4) """"""" */}

        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '20px' }}>



          {/* Live Telemetry Feed " 6-card grid */}

          <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>

              <h4 style={{ fontSize: '22px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '20px' }}>

                <NetworkIcon /> Live Telemetry Feed

              </h4>

              <span style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>ANONYMIZED</span>

            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

              {[

                {

                  icon: <DeviceIcon />, label: 'DEVICE IDENTITY',

                  main: dynamicScenario.signals.os,

                  sub: `Agent: ${dynamicScenario.signals.browser}`,

                  alert: dynamicScenario.signals.os.includes('Emulator') || dynamicScenario.signals.browser.includes('Headless'),

                  alertColor: 'rgba(245,158,11,0.2)'

                },

                {

                  icon: <NetworkIcon />, label: 'NETWORK SIGNATURE',

                  main: dynamicScenario.signals.ipAddress.split(' ')[0],

                  sub: dynamicScenario.signals.vpnDetected ? 'VPN/Proxy Active' : 'Direct ISP Connection',

                  alert: dynamicScenario.signals.vpnDetected,

                  alertColor: 'rgba(245,158,11,0.2)'

                },

                {

                  icon: <NetworkIcon />, label: 'GEO-VELOCITY',

                  main: dynamicScenario.signals.velocityKmh > 0 ? `${dynamicScenario.signals.velocityKmh} km/h` : 'Stable',

                  sub: dynamicScenario.signals.velocityKmh > 500 ? 'Impossible travel detected!' : 'Geo-spatial logs OK',

                  alert: dynamicScenario.signals.velocityKmh > 500,

                  alertColor: 'rgba(239,68,68,0.2)'

                },

                {

                  icon: <ActivityIcon />, label: 'KEYSTROKE CADENCE',

                  main: `${dynamicScenario.signals.typingCadence.speedKps} keys/sec`,

                  sub: `Deviation: ${Math.round(dynamicScenario.signals.typingCadence.deviation * 100)}%`,

                  alert: dynamicScenario.signals.typingCadence.deviation > 0.5,

                  alertColor: 'rgba(245,158,11,0.2)'

                },

                {

                  icon: <ActivityIcon />, label: 'MOUSE DYNAMICS',

                  main: `Jitter ${(dynamicScenario.signals.mouseJitter * 100).toFixed(0)}%`,

                  sub: dynamicScenario.signals.mouseJitter > 0.6 ? 'Robotic trajectory detected' : 'Human curves verified',

                  alert: dynamicScenario.signals.mouseJitter > 0.6,

                  alertColor: 'rgba(239,68,68,0.2)'

                },

                {

                  icon: <UserIcon />, label: 'ACCESS PRIVILEGE',

                  main: dynamicScenario.signals.privilegedAccess ? 'Enterprise Admin' : 'Standard Customer',

                  sub: `Sensitivity: ${dynamicScenario.signals.actionSensitivity}`,

                  alert: dynamicScenario.signals.privilegedAccess,

                  alertColor: 'rgba(239,68,68,0.2)'

                },

              ].map(card => (

                <div key={card.label} style={{

                  padding: '14px 16px', borderRadius: '12px',

                  background: card.alert ? card.alertColor.replace('0.2', '0.04') : 'rgba(255,255,255,0.015)',

                  border: `1px solid ${card.alert ? card.alertColor : 'rgba(255,255,255,0.04)'}`,

                  transition: 'all 0.4s ease'

                }}>

                  <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>

                    {card.icon} {card.label}

                  </div>

                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '3px' }}>{card.main}</div>

                  <div style={{ fontSize: '16px', color: card.alert ? (card.alertColor.includes('239') ? 'var(--color-danger)' : 'var(--color-warning)') : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{card.sub}</div>

                </div>

              ))}

            </div>



            {/* Geo travel arc */}

            {dynamicScenario.signals.velocityKmh > 500 && (

              <div style={{ height: '54px', background: 'rgba(0,0,0,0.4)', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.25)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', fontSize: '14px', fontFamily: 'var(--font-mono)' }}>

                <span style={{ color: 'var(--color-primary)' }}> New York (USA)</span>

                <svg width="120" height="28" viewBox="0 0 120 28" style={{ flex: 1, margin: '0 16px', overflow: 'visible' }}>

                  <path d="M 0 14 Q 60 2 120 14" fill="none" stroke="var(--color-danger)" strokeWidth="1.5" strokeDasharray="4 3" />

                  <circle cx="120" cy="14" r="4" fill="var(--color-danger)" className="pulse-animation" />

                  <circle cx="0" cy="14" r="4" fill="var(--color-primary)" />

                </svg>

                <span style={{ color: 'var(--color-danger)' }}> Frankfurt (GER)</span>

              </div>

            )}

          </div>



          {/* Privacy Guard - richer layout */}

          <div style={{ background: 'rgba(0,242,254,0.025)', border: '1px solid rgba(0,242,254,0.2)', borderRadius: '14px', padding: '28px', boxShadow: 'var(--glow-cyan)' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>

              <h4 style={{ fontSize: '22px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '20px' }}>

                <ShieldIcon /> Privacy Guard - Zero-Data Exposure

              </h4>

              <span style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--color-secure)', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)' }}>

                {dynamicScenario.privacy.localProcessingOnly ? 'On-Device Processing' : 'Cloud Processing'}

              </span>

            </div>

            <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '14px' }}>

              All PII remains local. Only masked hashes and anonymized signals are processed by the risk engine. No raw biometrics ever leave the device.

            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontFamily: 'var(--font-mono)', fontSize: '16px' }}>

              {[

                { k: 'Masked IP', v: dynamicScenario.privacy.anonymizedIp },

                { k: 'Device Hash', v: dynamicScenario.privacy.hashedDeviceFingerprint },

                { k: 'ZK Proof', v: dynamicScenario.privacy.zkpProofHash.substring(0, 22) + '...' },

                { k: 'DP Noise', v: dynamicScenario.privacy.differentialPrivacyNoiseLevel.substring(0, 28) + '...' },

              ].map(row => (

                <div key={row.k} style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(0,242,254,0.08)', overflow: 'hidden' }}>

                  <div style={{ color: 'var(--text-dark)', fontSize: '14px', marginBottom: '3px' }}>{row.k}</div>

                  <div style={{ color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.v}</div>

                </div>

              ))}

            </div>

          </div>



          {/* Keystroke Cadence Tester */}

          <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '28px', flex: 1, display: 'flex', flexDirection: 'column' }}>

            <h4 style={{ fontSize: '22px', color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '20px' }}>

              <ActivityIcon /> Interactive Keystroke Cadence Test

            </h4>

            <p style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: '1.5' }}>

              Type below to measure your keystroke timing variance live. Spikes above 70% trigger bot pattern warnings in real-time.

            </p>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch' }}>

              <input

                type="text"

                value={userTypedText}

                onChange={handleTyping}

                placeholder="Type normally, then fast - watch deviation spike..."

                style={{

                  flex: 1, background: 'rgba(0,0,0,0.45)', border: '1px solid var(--border-color)',

                  borderRadius: '10px', padding: '12px 16px', color: 'var(--text-main)',

                  fontFamily: 'var(--font-sans)', fontSize: '14px', outline: 'none',

                  transition: 'var(--transition-smooth)'

                }}

              />

              <div style={{

                fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 800,

                padding: '12px 18px', background: 'rgba(0,0,0,0.4)', borderRadius: '10px',

                border: `1px solid ${interactiveDeviation > 0.5 ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.06)'}`,

                minWidth: '110px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center',

                boxShadow: interactiveDeviation > 0.5 ? 'var(--glow-warning)' : 'none',

                transition: 'all 0.4s'

              }}>

                <div style={{ color: interactiveDeviation > 0.5 ? 'var(--color-warning)' : 'var(--color-secure)' }}>

                  {Math.round(interactiveDeviation * 100)}%

                </div>

                <div style={{ fontSize: '9px', color: 'var(--text-dark)', marginTop: '3px' }}>DEV</div>

              </div>

            </div>

          </div>

        </div>



        {/* --- RIGHT COLUMN (span 4) --- */}

        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '20px' }}>



          {/* Risk Calculator - larger gauge */}

          <div className={`glass-panel scanline-effect ${riskResult.level === 'HIGH' ? 'danger glow-danger' : riskResult.level === 'MEDIUM' ? 'warning glow-warning' : 'glow-secure'}`} style={{

            padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',

            borderColor: getRiskColor(riskResult.level)

          }}>

            <div style={{ alignSelf: 'stretch', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>

              <h4 style={{ fontSize: '22px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '20px' }}>

                <ActivityIcon /> PrismID Risk Engine

              </h4>

              <span style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: getRiskColor(riskResult.level) }}>LIVE SCORING</span>

            </div>



            {/* Larger SVG gauge */}

            <div style={{ position: 'relative', width: '100%', height: '180px', display: 'flex', justifyContent: 'center', marginTop: '8px' }}>

              <svg width="210" height="160" viewBox="0 0 230 175">

                {/* Background track */}

                <path d="M 25 140 A 90 90 0 0 1 205 140" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="18" strokeLinecap="round" />

                {/* Zone coloring: green 0-30, amber 30-70, red 70-100 */}

                <path d="M 25 140 A 90 90 0 0 1 205 140" fill="none" stroke="rgba(16,185,129,0.15)" strokeWidth="18" strokeLinecap="round" strokeDasharray="88 284" />

                <path d="M 25 140 A 90 90 0 0 1 205 140" fill="none" stroke="rgba(245,158,11,0.12)" strokeWidth="18" strokeLinecap="round" strokeDasharray="113 284" strokeDashoffset="-88" />

                <path d="M 25 140 A 90 90 0 0 1 205 140" fill="none" stroke="rgba(239,68,68,0.12)" strokeWidth="18" strokeLinecap="round" strokeDasharray="84 284" strokeDashoffset="-200" />

                {/* Active progress arc */}

                <path

                  d="M 25 140 A 90 90 0 0 1 205 140"

                  fill="none"

                  stroke={getRiskColor(riskResult.level)}

                  strokeWidth="18"

                  strokeLinecap="round"

                  strokeDasharray={`${(animatedScore / 100) * 284}, 284`}

                  style={{ transition: 'stroke-dasharray 0.8s ease, stroke 0.8s' }}

                  filter={`drop-shadow(0 0 8px ${getRiskColor(riskResult.level)})`}

                />

                {/* Tick marks */}

                {[0, 30, 70, 100].map((tick) => {

                  const angle = -180 + (tick / 100) * 180;

                  const rad = (angle * Math.PI) / 180;

                  const cx = 115 + 90 * Math.cos(rad);

                  const cy = 140 + 90 * Math.sin(rad);

                  return <circle key={tick} cx={cx} cy={cy} r="3" fill="rgba(255,255,255,0.3)" />;

                })}

              </svg>

              {/* Center score */}

              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -30%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                <span style={{ fontSize: '52px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-main)', lineHeight: '1', textShadow: `0 0 30px ${getRiskColor(riskResult.level)}55` }}>

                  {animatedScore}

                </span>

                <span style={{ fontSize: '14px', fontWeight: 800, color: getRiskColor(riskResult.level), marginTop: '4px', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>

                  {riskResult.level} RISK

                </span>

              </div>

            </div>



            {/* Action pill */}

            <div style={{ width: '100%', padding: '14px 16px', borderRadius: '10px', background: 'rgba(0,0,0,0.35)', border: `1px solid rgba(${riskResult.level === 'LOW' ? '16,185,129' : riskResult.level === 'MEDIUM' ? '245,158,11' : '239,68,68'}, 0.3)`, marginTop: '4px' }}>

              <div style={{ fontSize: '14px', color: 'var(--text-dark)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', marginBottom: '4px' }}>ENGINE ACTION</div>

              <div style={{ fontSize: '16px', fontWeight: 700, color: getRiskColor(riskResult.level) }}>

                {riskResult.recommendedAction === 'ALLOW' && 'Seamless Access Granted'}

                {riskResult.recommendedAction === 'MFA_CHALLENGE' && 'Passkey Step-Up Required'}

                {riskResult.recommendedAction === 'KYC_VERIFICATION' && 'Liveness Selfie Check'}

                {riskResult.recommendedAction === 'BLOCK_SESSION' && 'Session Suspended'}

              </div>

            </div>



            {/* Verify button */}

            {riskResult.recommendedAction !== 'ALLOW' && !verificationSuccess && (

              <button

                onClick={() => { setVerificationType(riskResult.recommendedAction === 'MFA_CHALLENGE' ? 'MFA' : 'KYC'); setShowVerificationModal(true); }}

                className="cyber-button active"

                style={{ marginTop: '12px', width: '100%', justifyContent: 'center', background: getRiskColor(riskResult.level), color: '#000', fontWeight: 700, borderColor: 'transparent', padding: '12px 16px', fontSize: '14px', boxShadow: `0 0 20px rgba(${riskResult.level === 'LOW' ? '16,185,129' : riskResult.level === 'MEDIUM' ? '245,158,11' : '239,68,68'}, 0.35)` }}

              >

                Verify Challenge

              </button>

            )}



            {/* Breakdown bars - larger */}

            <div style={{ width: '100%', marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '11px' }}>

              {[

                { label: 'Device Signature',   score: riskResult.breakdown.deviceRisk,        max: 20, color: 'var(--color-primary)'   },

                { label: 'Network & Geo',       score: riskResult.breakdown.networkRisk,       max: 25, color: 'var(--color-accent)'    },

                { label: 'Behavioral',          score: riskResult.breakdown.behavioralRisk,    max: 25, color: 'var(--color-secondary)' },

                { label: 'Action & Privileged', score: riskResult.breakdown.transactionalRisk + riskResult.breakdown.privilegedRisk, max: 30, color: 'var(--color-danger)' },

              ].map(b => (

                <div key={b.label}>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '5px' }}>

                    <span style={{ color: 'var(--text-muted)' }}>{b.label}</span>

                    <span style={{ fontFamily: 'var(--font-mono)', color: b.score > 0 ? b.color : 'var(--text-dark)', fontWeight: 700 }}>{b.score}/{b.max}</span>

                  </div>

                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden' }}>

                    <div style={{ width: `${(b.score / b.max) * 100}%`, height: '100%', background: `linear-gradient(90deg, ${b.color}88, ${b.color})`, borderRadius: '3px', transition: 'width 1s ease', boxShadow: b.score > 0 ? `0 0 6px ${b.color}66` : 'none' }} />

                  </div>

                </div>

              ))}

            </div>

          </div>



          {/* Live Risk Line Chart */}

          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

              <h4 style={{ fontSize: '22px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '20px' }}>

                <ActivityIcon /> Live Risk Score Wave

              </h4>

              <span style={{ fontSize: '14px', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)', background: 'rgba(0,242,254,0.08)', padding: '2px 8px', borderRadius: '8px', border: '1px solid rgba(0,242,254,0.2)' }}>LIVE</span>

            </div>

            <canvas ref={canvasRef} width="500" height="110" style={{ width: '100%', height: '110px', display: 'block', borderRadius: '8px' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontFamily: 'var(--font-mono)', color: 'var(--text-dark)' }}>

              <span>15 readings ago</span>

              <span style={{ color: getRiskColor(riskResult.level) }}>Current: {riskResult.score}%</span>

              <span>Now &rarr;</span>

            </div>

          </div>



          {/* Triggered Signals Summary card */}

          <div style={{ background: `rgba(${riskResult.level === 'HIGH' ? '239,68,68' : riskResult.level === 'MEDIUM' ? '245,158,11' : '16,185,129'}, 0.04)`, border: `1px solid rgba(${riskResult.level === 'HIGH' ? '239,68,68' : riskResult.level === 'MEDIUM' ? '245,158,11' : '16,185,129'}, 0.18)`, borderRadius: '14px', padding: '28px', transition: 'all 0.5s', flex: 1 }}>

            <div style={{ fontSize: '16px', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.08em', color: getRiskColor(riskResult.level), marginBottom: '12px' }}>

               TRIGGERED ANOMALY SIGNALS - {riskResult.triggeredSignals.length} DETECTED

            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {riskResult.triggeredSignals.map((sig, idx) => (

                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '16px', color: 'var(--text-main)' }}>

                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: getRiskColor(riskResult.level), display: 'inline-block', flexShrink: 0, boxShadow: `0 0 6px ${getRiskColor(riskResult.level)}` }} />

                  {sig}

                </div>

              ))}

            </div>

          </div>

        </div>



      </div>



      {/* ========================================================================================================================= 

          NEW PANEL 1: AI Explainability Panel

          =========================================================================================================================  */}

      <div className="glass-panel" style={{ padding: '32px' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '16px' }}>

          <div>

            <div style={{ fontSize: '16px', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '4px' }}>

              EXPLAINABLE AI -- DECISION RATIONALE

            </div>

            <h3 style={{ fontSize: '15px', color: 'var(--text-main)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '20px' }}>

              Why was this risk decision made?

            </h3>

          </div>

          {/* RBI / DPDP compliance badges */}

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>

            <span className="compliance-badge">RBI CIR 2024-01</span>

            <span className="compliance-badge">DPDP Act 2023</span>

            <span className="compliance-badge green">ISO 27001</span>

            <span className="compliance-badge green">PCI-DSS 10.2</span>

          </div>

        </div>



        {/* Two-section layout: Signal breakdown bars + triggered signals */}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>



          {/* LEFT: Animated signal contribution bars */}

          <div>

            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '14px', letterSpacing: '0.05em' }}>

              SIGNAL WEIGHT BREAKDOWN

            </div>

            {[

              { label: 'Device Fingerprint',    score: riskResult.breakdown.deviceRisk,        max: 20, color: 'var(--color-primary)',   icon: 'PC' },

              { label: 'Network & Geo-Velocity', score: riskResult.breakdown.networkRisk,        max: 25, color: 'var(--color-accent)',    icon: 'NET' },

              { label: 'Behavioral Biometrics',  score: riskResult.breakdown.behavioralRisk,     max: 25, color: 'var(--color-secondary)', icon: 'BIO' },

              { label: 'Transaction Sensitivity',score: riskResult.breakdown.transactionalRisk,  max: 15, color: 'var(--color-warning)',   icon: 'TXN' },

              { label: 'Privileged Access Risk',  score: riskResult.breakdown.privilegedRisk,    max: 15, color: 'var(--color-danger)',    icon: 'ADM' },

            ].map(item => {

              const pct = Math.round((item.score / item.max) * 100);

              return (

                <div key={item.label} style={{ marginBottom: '13px' }}>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', marginBottom: '5px', alignItems: 'center' }}>

                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>

                      <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: item.color, background: `${item.color}22`, border: `1px solid ${item.color}44`, borderRadius: '4px', padding: '1px 5px', letterSpacing: '0.04em' }}>{item.icon}</span>{item.label}

                    </span>

                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', color: item.score > 0 ? item.color : 'var(--text-dark)', fontWeight: 700 }}>

                      {item.score}/{item.max} pts ({pct}%)

                    </span>

                  </div>

                  <div style={{ width: '100%', height: '7px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden' }}>

                    <div

                      key={`${item.label}-${riskResult.score}`}

                      className="explain-bar-fill"

                      style={{

                        '--bar-target-width': `${pct}%`,

                        width: `${pct}%`,

                        background: `linear-gradient(90deg, ${item.color}88, ${item.color})`,

                        boxShadow: item.score > 0 ? `0 0 8px ${item.color}55` : 'none'

                      } as React.CSSProperties}

                    />

                  </div>

                </div>

              );

            })}

          </div>



          {/* RIGHT: Triggered signals + plain-language explanation */}

          <div>

            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '14px', letterSpacing: '0.05em' }}>

              FLAGGED ANOMALY SIGNALS

            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '18px' }}>

              {riskResult.triggeredSignals.map((sig, idx) => (

                <div key={idx} style={{

                  display: 'flex', alignItems: 'flex-start', gap: '20px',

                  padding: '8px 12px', borderRadius: '8px',

                  background: riskResult.level === 'HIGH' ? 'rgba(239,68,68,0.05)' : riskResult.level === 'MEDIUM' ? 'rgba(245,158,11,0.05)' : 'rgba(16,185,129,0.05)',

                  border: `1px solid ${riskResult.level === 'HIGH' ? 'rgba(239,68,68,0.15)' : riskResult.level === 'MEDIUM' ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)'}`

                }}>

                  <span style={{ color: getRiskColor(riskResult.level), fontSize: '14px', marginTop: '1px', flexShrink: 0 }}>

                    {riskResult.level === 'HIGH' ? '"' : riskResult.level === 'MEDIUM' ? '' : ''}

                  </span>

                  <span style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.5' }}>{sig}</span>

                </div>

              ))}

            </div>



            {/* Plain-language decision summary */}

            <div style={{

              padding: '14px', borderRadius: '10px',

              background: 'rgba(0,0,0,0.3)',

              border: `1px solid rgba(${riskResult.level === 'HIGH' ? '239,68,68' : riskResult.level === 'MEDIUM' ? '245,158,11' : '16,185,129'}, 0.2)`

            }}>

              <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '6px' }}>

                AI DECISION SUMMARY

              </div>

              <p style={{ fontSize: '12.5px', color: 'var(--text-main)', lineHeight: '1.65' }}>

                {riskResult.level === 'LOW'

                  ? 'All signals are within expected bounds. Device is recognized, location is stable, and behavioral patterns match the historical baseline. Session is permitted without friction.'

                  : riskResult.level === 'MEDIUM'

                    ? `${riskResult.triggeredSignals.length} anomalous signal(s) raised moderate concern. Trust score exceeded 30% threshold. A step-up MFA passkey challenge has been triggered to re-establish identity confidence.`

                    : `${riskResult.triggeredSignals.length} high-severity signal(s) indicate active exploitation or unauthorized access. Risk score exceeded 70%. Session has been suspended and KYC liveness verification is required before access is restored.`

                }

              </p>

            </div>

          </div>

        </div>

      </div>



      {/* 

          NEW PANEL 2: " Risk Score Bar Timeline + Privacy Widget

           */}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>



        {/* Risk bar chart timeline */}

        <div className="glass-panel" style={{ padding: '28px' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '20px' }}>

            <h4 style={{ fontSize: '22px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '20px' }}>

              <ActivityIcon /> Session Risk Timeline (Last 15 Readings)

            </h4>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--text-dark)' }}>

              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--color-secure)', display: 'inline-block' }} /> LOW</span>

              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--color-warning)', display: 'inline-block' }} /> MED</span>

              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--color-danger)', display: 'inline-block' }} /> HIGH</span>

            </div>

          </div>



          {/* Bar chart */}

          <div style={{ position: 'relative', height: '100px', display: 'flex', alignItems: 'flex-end', gap: '4px', padding: '0 0 18px 0' }}>

            {/* Threshold line at 70% */}
            <div style={{ position: 'absolute', bottom: `${(70 / 100) * 82 + 18}px`, left: 0, right: 0, borderBottom: '1px dashed rgba(239,68,68,0.5)', zIndex: 2 }}>
              <span style={{ position: 'absolute', right: 0, top: '-14px', fontSize: '12px', color: 'var(--color-danger)', fontFamily: 'var(--font-mono)', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(239,68,68,0.2)', fontWeight: 600 }}>HIGH 70%</span>
            </div>

            {/* Threshold line at 30% */}
            <div style={{ position: 'absolute', bottom: `${(30 / 100) * 82 + 18}px`, left: 0, right: 0, borderBottom: '1px dashed rgba(245,158,11,0.5)', zIndex: 2 }}>
              <span style={{ position: 'absolute', right: 0, top: '-14px', fontSize: '12px', color: 'var(--color-warning)', fontFamily: 'var(--font-mono)', background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(245,158,11,0.2)', fontWeight: 600 }}>MED 30%</span>
            </div>



            {riskHistory.map((val, idx) => {

              const barColor = val >= 70 ? 'var(--color-danger)' : val >= 30 ? 'var(--color-warning)' : 'var(--color-secure)';

              const barH = `${Math.max(3, (val / 100) * 82)}px`;

              const isLatest = idx === riskHistory.length - 1;

              return (

                <div key={idx} className="risk-bar-col">

                  <div

                    className="bar-fill"

                    style={{

                      '--bar-height': barH,

                      height: barH,

                      background: `linear-gradient(180deg, ${barColor}, ${barColor}88)`,

                      boxShadow: isLatest ? `0 0 8px ${barColor}` : 'none',

                      opacity: isLatest ? 1 : 0.5 + (idx / riskHistory.length) * 0.5,

                      border: isLatest ? `1px solid ${barColor}` : 'none'

                    } as React.CSSProperties}

                  />

                  {isLatest && (

                    <span style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: barColor, marginTop: '2px' }}>{val}%</span>

                  )}

                </div>

              );

            })}

          </div>

        </div>



        {/* Privacy & ZK-Proof Status Widget */}

        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          <div style={{ fontSize: '16px', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.08em' }}>

             PRIVACY & ZK-PROOF STATUS

          </div>

          {[

            { label: 'On-Device Processing',  value: dynamicScenario.privacy.localProcessingOnly ? 'ACTIVE' : 'CLOUD', ok: dynamicScenario.privacy.localProcessingOnly, icon: '' },

            { label: 'PII Anonymization',     value: 'IP  ' + dynamicScenario.privacy.anonymizedIp,                  ok: true,                                        icon: '' },

            { label: 'ZK-SNARK Proof',        value: dynamicScenario.privacy.zkpProofHash.substring(0, 20) + '',    ok: true,                                        icon: '"' },

            { label: 'Differential Privacy',  value: dynamicScenario.privacy.differentialPrivacyNoiseLevel,           ok: !dynamicScenario.privacy.differentialPrivacyNoiseLevel.includes('No DP'), icon: '' },

            { label: 'Hash Fingerprint',      value: dynamicScenario.privacy.hashedDeviceFingerprint,                 ok: true,                                        icon: '"' },

          ].map(item => (

            <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '9px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.03)' }}>

              <span style={{ fontSize: '14px', flexShrink: 0 }}>{item.icon}</span>

              <div style={{ flex: 1, minWidth: 0 }}>

                <div style={{ fontSize: '14px', color: 'var(--text-dark)', fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>{item.label}</div>

                <div style={{ fontSize: '16px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</div>

              </div>

              <span style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: item.ok ? 'var(--color-secure)' : 'var(--color-warning)', flexShrink: 0 }}>

                {item.ok ? '"' : ' '}

              </span>

            </div>

          ))}

        </div>

      </div>



      {/* 

          NEW PANEL 3: " Compliance Audit Log

           */}

      <div className="glass-panel" style={{ padding: '32px' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>

          <h4 style={{ fontSize: '22px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '20px' }}>

            <LockIcon /> Compliance Audit Log

            <span style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', background: 'rgba(0,242,254,0.08)', padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(0,242,254,0.2)' }}>

              TAMPER-PROOF -- IMMUTABLE

            </span>

          </h4>

          <div style={{ fontSize: '16px', color: 'var(--text-dark)', fontFamily: 'var(--font-mono)' }}>

            {auditLog.length === 0 ? 'Awaiting events -- select a scenario to begin' : `${auditLog.length} event(s) recorded`}

          </div>

        </div>



        {auditLog.length === 0 ? (

          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-dark)', fontSize: '16px', fontFamily: 'var(--font-mono)', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '8px' }}>

            No audit events yet. Click a threat scenario above to generate a compliance-tagged log entry.

          </div>

        ) : (

          <div style={{ overflowX: 'auto' }}>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', fontFamily: 'var(--font-mono)' }}>

              <thead>

                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>

                  {['Time', 'Scenario', 'Channel', 'Score', 'Level', 'Action', 'Compliance Tags'].map(h => (

                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '14px', color: 'var(--text-dark)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>

                  ))}

                </tr>

              </thead>

              <tbody>

                {auditLog.map((entry, idx) => (

                  <tr key={entry.id} style={{

                    borderBottom: '1px solid rgba(255,255,255,0.03)',

                    background: idx === 0 ? `rgba(${entry.level === 'HIGH' ? '239,68,68' : entry.level === 'MEDIUM' ? '245,158,11' : '16,185,129'}, 0.04)` : 'transparent',

                    transition: 'background 0.3s'

                  }}>

                    <td style={{ padding: '10px 12px', color: 'var(--text-dark)', whiteSpace: 'nowrap' }}>{entry.time}</td>

                    <td style={{ padding: '10px 12px', color: 'var(--text-main)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.scenario}</td>

                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>

                      <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(79,172,254,0.1)', color: 'var(--color-accent)', fontSize: '14px' }}>{entry.channel}</span>

                    </td>

                    <td style={{ padding: '10px 12px', fontWeight: 700, color: getRiskColor(entry.level), whiteSpace: 'nowrap' }}>{entry.score}%</td>

                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>

                      <span style={{

                        padding: '2px 8px', borderRadius: '4px', fontSize: '14px', fontWeight: 700,

                        background: `rgba(${entry.level === 'HIGH' ? '239,68,68' : entry.level === 'MEDIUM' ? '245,158,11' : '16,185,129'}, 0.12)`,

                        color: getRiskColor(entry.level)

                      }}>{entry.level}</span>

                    </td>

                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontSize: '16px' }}>{entry.action.replace(/_/g, ' ')}</td>

                    <td style={{ padding: '10px 12px' }}>

                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>

                        {entry.compliance.map(tag => (

                          <span key={tag} style={{ padding: '2px 7px', borderRadius: '10px', fontSize: '9.5px', fontWeight: 700, background: 'rgba(0,242,254,0.06)', color: 'var(--color-primary)', border: '1px solid rgba(0,242,254,0.15)', whiteSpace: 'nowrap' }}>

                            {tag}

                          </span>

                        ))}

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>



      {/* High-Fidelity Verification Interactive Dialog Modal */}

      {showVerificationModal && (

        <div style={{

          position: 'fixed',

          top: 0,

          left: 0,

          width: '100vw',

          height: '100vh',

          backgroundColor: 'rgba(3, 4, 8, 0.9)',

          backdropFilter: 'blur(12px)',

          display: 'flex',

          justifyContent: 'center',

          alignItems: 'center',

          zIndex: 100

        }}>

          <div className="glass-panel scanline-effect" style={{

            width: '920px',

            padding: '36px',

            boxShadow: '0 25px 60px rgba(0,0,0,0.6)',

            borderWidth: '1.5px',

            borderColor: verificationType === 'MFA' ? 'var(--color-primary)' : 'var(--color-warning)',

            position: 'relative',

            transition: 'width 0.3s ease-in-out',

            display: 'flex',

            flexDirection: 'row',

            gap: '32px',

            alignItems: 'stretch',

            maxWidth: '95vw'

          }}>

            

            {/* Modal close button */}
            <button
              onClick={() => setShowVerificationModal(false)}
              title="Close"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                zIndex: 10,
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)';
                e.currentTarget.style.color = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>



            {verificationType === 'MFA' ? (

              // Cinematic Widescreen Fingerprint Split Screen Layout

              <div style={{ display: 'flex', width: '100%', gap: '32px', alignItems: 'stretch', textAlign: 'left', flexWrap: 'wrap' }}>

                

                {/* Left Column: Capacitive Fingerprint Scanner Viewport */}

                <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center', justifyContent: 'center' }}>

                  <div style={{ alignSelf: 'flex-start', fontSize: '16px', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)', fontWeight: 'bold', letterSpacing: '0.08em' }}>

                    LIVE CAPACITIVE FEED (RIDGE MAPPING)

                  </div>

                  

                  {/* Fingerprint outer rings and circular viewport */}

                  <div className="camera-outer-ring">

                    {/* Concentric Rotating Outer HUD Gears */}

                    <svg className="hud-ring-decor radar-sweep" viewBox="0 0 100 100" style={{ position: 'absolute', width: '320px', height: '320px', opacity: 0.35, color: 'var(--color-primary)' }}>

                      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 3" />

                      <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="0.25" strokeDasharray="6 4" />

                    </svg>

                    

                    <svg className="hud-ring-decor radar-sweep-reverse" viewBox="0 0 100 100" style={{ position: 'absolute', width: '305px', height: '305px', opacity: 0.25, color: 'var(--color-primary)' }}>

                      <circle cx="50" cy="50" r="49" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 10" />

                      <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="15 3 2 3" />

                    </svg>



                    <svg className="hud-ring-decor" viewBox="0 0 100 100" style={{ position: 'absolute', width: '290px', height: '290px', opacity: 0.6, color: 'var(--color-primary)' }}>

                      {/* Crosshair target markers */}

                      <line x1="50" y1="2" x2="50" y2="8" stroke="currentColor" strokeWidth="0.8" />

                      <line x1="50" y1="92" x2="50" y2="98" stroke="currentColor" strokeWidth="0.8" />

                      <line x1="2" y1="50" x2="8" y2="50" stroke="currentColor" strokeWidth="0.8" />

                      <line x1="92" y1="50" x2="98" y2="50" stroke="currentColor" strokeWidth="0.8" />

                      

                      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="30 5" />

                    </svg>



                    {/* Glowing Circular Viewport */}

                    <div className="circular-camera-viewport" style={{ borderColor: 'var(--color-primary)', boxShadow: '0 0 25px rgba(0, 242, 254, 0.25)' }}>

                      

                      {/* Fingerprint Vector Art */}

                      <div style={{ position: 'relative', width: '130px', height: '160px', zIndex: 3 }}>

                        <svg width="100%" height="100%" viewBox="0 0 100 120" style={{ color: isVerifying ? 'var(--color-primary)' : 'var(--text-muted)' }}>

                          {/* Fingerprint Ridges */}

                          <g className="hologram-pulse" style={{ fill: 'none', stroke: 'currentColor', strokeWidth: '1.6', strokeLinecap: 'round', transition: 'color 0.4s ease' }}>

                            {/* Center core loops */}

                            <path d="M 50 70 A 5 5 0 0 1 50 60 A 5 5 0 0 1 52 70" />

                            <path d="M 50 75 A 10 10 0 0 1 50 55 A 10 10 0 0 1 55 75" />

                            <path d="M 50 80 A 15 15 0 0 1 50 50 A 15 15 0 0 1 58 80" />

                            

                            {/* Arches wrapping around */}

                            <path d="M 46 85 A 20 20 0 0 1 50 45 A 20 20 0 0 1 61 85" />

                            <path d="M 42 90 A 25 25 0 0 1 50 40 A 25 25 0 0 1 64 90" />

                            <path d="M 38 95 A 30 30 0 0 1 50 35 A 30 30 0 0 1 67 95" />

                            <path d="M 34 100 A 35 35 0 0 1 50 30 A 35 35 0 0 1 70 100" />

                            <path d="M 30 105 A 40 40 0 0 1 50 25 A 40 40 0 0 1 73 105" />

                            

                            {/* Outer contours */}

                            <path d="M 26 110 A 45 45 0 0 1 50 20 A 45 45 0 0 1 76 110" />

                            <path d="M 22 115 A 50 50 0 0 1 50 15 A 50 50 0 0 1 79 115" />

                          </g>



                          {/* Minutiae Nodes Lock Animation */}

                          {(() => {

                            const renderFingerprintNode = (cx: number, cy: number, reqProgress: number) => {

                              const isLocked = verificationProgress >= reqProgress;

                              const isPending = isVerifying && verificationProgress < reqProgress;

                              let color = "rgba(255, 255, 255, 0.18)";

                              if (isLocked) color = "var(--color-secure)";

                              else if (isPending) color = "var(--color-warning)";



                              return (

                                <circle

                                  cx={cx}

                                  cy={cy}

                                  r={isLocked ? "1.8" : "1.3"}

                                  fill={color}

                                  className={isPending ? "node-pulse-active" : ""}

                                  style={{

                                    transition: 'all 0.3s ease',

                                    filter: isLocked ? 'drop-shadow(0 0 3px var(--color-secure))' : isPending ? 'drop-shadow(0 0 3px var(--color-warning))' : 'none'

                                  }}

                                />

                              );

                            };

                            return (

                              <g>

                                {renderFingerprintNode(50, 60, 10)}  {/* Core */}

                                {renderFingerprintNode(50, 50, 20)}  {/* Center Arch */}

                                {renderFingerprintNode(40, 55, 30)}  {/* Left Inner Arch */}

                                {renderFingerprintNode(60, 55, 40)}  {/* Right Inner Arch */}

                                {renderFingerprintNode(45, 40, 50)}  {/* Left Mid Arch */}

                                {renderFingerprintNode(55, 40, 60)}  {/* Right Mid Arch */}

                                {renderFingerprintNode(35, 30, 70)}  {/* Left Outer Arch */}

                                {renderFingerprintNode(65, 30, 80)}  {/* Right Outer Arch */}

                                {renderFingerprintNode(50, 20, 90)}  {/* Upper Arch */}

                                {renderFingerprintNode(50, 80, 98)}  {/* Lower Base Loop */}

                              </g>

                            );

                          })()}

                        </svg>

                      </div>



                      {/* Sweeping scan laser (Clipped to circular viewport) */}

                      {isVerifying && <div className="scan-laser fingerprint-laser-line" style={{ background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)', boxShadow: '0 0 10px var(--color-primary), 0 0 20px var(--color-primary)' }} />}



                      {/* HUD Scan Status Banner */}

                      <div style={{

                        position: 'absolute',

                        top: '16px',

                        left: '50%',

                        transform: 'translateX(-50%)',

                        fontFamily: 'var(--font-mono)',

                        fontSize: '8px',

                        color: 'var(--color-primary)',

                        display: 'flex',

                        alignItems: 'center',

                        gap: '4px',

                        background: 'rgba(0,0,0,0.85)',

                        padding: '3px 8px',

                        borderRadius: '10px',

                        border: '1px solid rgba(0, 242, 254, 0.3)',

                        whiteSpace: 'nowrap',

                        zIndex: 6

                      }}>

                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} className="pulse-animation"></span>

                        {isVerifying ? 'SCANNING DERMIS' : 'SENSOR READY'}

                      </div>



                    </div>

                  </div>



                  {/* Fingerprint sensor status card */}

                  <div style={{

                    padding: '10px 16px',

                    background: 'rgba(0,0,0,0.2)',

                    border: '1px solid rgba(255,255,255,0.02)',

                    borderRadius: '8px',

                    fontFamily: 'var(--font-mono)',

                    fontSize: '16px',

                    display: 'flex',

                    justifyContent: 'space-between',

                    color: 'var(--text-muted)',

                    width: '100%',

                    maxWidth: '320px'

                  }}>

                    <span>CAPACITANCE: 99.4%</span>

                    <span style={{ color: isVerifying ? 'var(--color-secure)' : 'var(--text-dark)' }}>

                      STATE: {isVerifying ? 'ANALYZING' : 'AWAITING CONTACT'}

                    </span>

                  </div>

                </div>



                {/* Right Column: Biometric Credential Analytics HUD */}

                <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>

                  

                  <div>

                    <h3 style={{ fontSize: '15px', marginBottom: '8px', color: 'var(--text-main)', marginTop: 0 }}>FIDO2 / WebAuthn Device Check</h3>

                    <p style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: '1.5', margin: 0 }}>

                      Anomalous context detected. PrismID is requiring a cryptographic device check (e.g. fingerprint or passkey) to verify possession of the primary trusted device.

                    </p>

                  </div>



                  {/* Cinematic Fingerprint Scanning Holographic Box */}

                  <div className="cinematic-hud-panel scanline-effect" style={{ borderColor: isVerifying ? 'var(--color-primary)' : 'var(--border-color)', minHeight: '230px', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '32px' }}>

                    

                    {/* Rotating Scanner Radar Widget */}

                    <div style={{ width: '130px', height: '130px', position: 'relative', flexShrink: 0 }}>

                      <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ color: isVerifying ? 'var(--color-primary)' : 'var(--text-muted)' }}>

                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1.5 2" />

                        <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeWidth="0.5" />

                        

                        <line x1="50" y1="50" x2="50" y2="5" stroke="var(--color-primary)" strokeWidth="1" className="radar-sweep" />

                        

                        {/* Fingerprint loop mockup inside the radar */}

                        <path d="M 50 32 A 18 18 0 0 1 50 68" fill="none" stroke="rgba(0, 242, 254, 0.25)" strokeWidth="1" strokeLinecap="round" />

                        <path d="M 50 38 A 12 12 0 0 1 50 62" fill="none" stroke="rgba(0, 242, 254, 0.4)" strokeWidth="1" strokeLinecap="round" />

                        <path d="M 50 44 A 6 6 0 0 1 50 56" fill="none" stroke="var(--color-primary)" strokeWidth="1" strokeLinecap="round" />

                      </svg>

                    </div>



                    {/* Numeric tracking indicators */}

                    <div style={{

                      flex: 1,

                      display: 'flex',

                      flexDirection: 'column',

                      gap: '20px',

                      fontFamily: 'var(--font-mono)',

                      fontSize: '16px',

                      color: 'var(--text-muted)'

                    }}>

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '4px' }}>

                        <span>Class Pattern:</span>

                        <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>Loop (Whorl Sub-type)</span>

                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '4px' }}>

                        <span>Minutiae Mapped:</span>

                        <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>

                          {isVerifying ? `${Math.floor(20 + (verificationProgress/100)*64)} / 84` : '0 / 84'}

                        </span>

                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '4px' }}>

                        <span>Pore Alignment:</span>

                        <span style={{ color: verificationProgress > 60 ? 'var(--color-secure)' : 'var(--text-main)', fontWeight: 'bold' }}>

                          {verificationProgress > 60 ? '99.4% (MATCH)' : 'Aligning...'}

                        </span>

                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '4px' }}>

                        <span>Conductivity Check:</span>

                        <span style={{ color: verificationProgress > 80 ? 'var(--color-secure)' : 'var(--text-main)' }}>

                          {verificationProgress > 80 ? '1.4 mS (LIVING)' : 'Measuring...'}

                        </span>

                      </div>

                    </div>

                  </div>



                  {/* Real-time Dynamic Telemetry Scrolling Logs */}

                  <div className="terminal-ticker-container" style={{ color: 'var(--color-primary)', borderColor: 'rgba(0, 242, 254, 0.15)' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0, 242, 254, 0.15)', paddingBottom: '3px', marginBottom: '5px', fontSize: '9px', opacity: 0.8 }}>

                      <span>- SECURE ENCLAVE HARDWARE INTEGRITY</span>

                      <span style={{ color: 'var(--color-accent)' }}>{verificationProgress}% MATCH</span>

                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'hidden' }}>

                      {(() => {

                        const tickerLogs: string[] = [];

                        tickerLogs.push(`[SYSTEM] Capacitative contact sensor detected finger placement.`);

                        if (verificationProgress >= 15) tickerLogs.push(`[SCAN] Extracting epidermal ridge flow map...`);

                        if (verificationProgress >= 30) tickerLogs.push(`[MESH] Mapping minutiae terminations & bifurcations.`);

                        if (verificationProgress >= 45) tickerLogs.push(`[BIOMETRIC] Pore density alignment: 99.4% match.`);

                        if (verificationProgress >= 60) tickerLogs.push(`[LIVENESS] Dermal conductivity: 1.4 mS (PASS).`);

                        if (verificationProgress >= 70) tickerLogs.push(`Handshaking with secure enclave co-processor.`);

                        if (verificationProgress >= 85) tickerLogs.push(`[ZK-PROOF] Compiling zero-knowledge credentials proof.`);

                        if (verificationProgress >= 100) tickerLogs.push(`[SUCCESS] Passkey handshake complete. Trust score restored.`);

                        

                        // Show only the last 5 logs to simulate scrolling

                        return tickerLogs.slice(-5).map((ln, idx) => (

                          <div key={idx} style={{ 

                            textOverflow: 'ellipsis', 

                            whiteSpace: 'nowrap', 

                            overflow: 'hidden',

                            opacity: idx === tickerLogs.slice(-5).length - 1 ? 1 : 0.6,

                            color: ln.includes('[SUCCESS]') ? 'var(--color-secure)' : ln.includes('[SYSTEM]') ? 'var(--color-primary)' : 'var(--color-accent)'

                          }}>

                            {ln}

                          </div>

                        ));

                      })()}

                    </div>

                  </div>



                  {/* Proving logs/loading bar */}

                  {isVerifying && renderProgressSection()}



                  {/* Actions buttons */}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {renderActionButtons()}

                    

                    <div style={{ fontSize: '14px', color: 'var(--text-dark)', fontFamily: 'var(--font-mono)', textAlign: 'center', marginTop: '4px' }}>

                      Biometrics processed on-device. Zero trust credentials never leave local storage.

                    </div>

                  </div>



                </div>



              </div>

            ) : (

              // Cinematic Widescreen KYC Split Screen Layout

              <div style={{ display: 'flex', width: '100%', gap: '32px', alignItems: 'stretch', textAlign: 'left', flexWrap: 'wrap' }}>

                

                {/* Left Column: Circular Biometric Camera Viewport */}

                <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center', justifyContent: 'center' }}>

                  <div style={{ alignSelf: 'flex-start', fontSize: '16px', color: 'var(--color-warning)', fontFamily: 'var(--font-mono)', fontWeight: 'bold', letterSpacing: '0.08em' }}>

                    LIVE BIOMETRIC FEED (OPTICAL MAPPING)

                  </div>

                  

                  {/* Camera outer rings and circular viewport */}

                  <div className="camera-outer-ring">

                    {/* Concentric Rotating Outer HUD Gears */}

                    <svg className="hud-ring-decor radar-sweep" viewBox="0 0 100 100" style={{ position: 'absolute', width: '320px', height: '320px', opacity: 0.35 }}>

                      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 3" />

                      <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="0.25" strokeDasharray="6 4" />

                    </svg>

                    

                    <svg className="hud-ring-decor radar-sweep-reverse" viewBox="0 0 100 100" style={{ position: 'absolute', width: '305px', height: '305px', opacity: 0.25 }}>

                      <circle cx="50" cy="50" r="49" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 10" />

                      <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="15 3 2 3" />

                    </svg>



                    <svg className="hud-ring-decor" viewBox="0 0 100 100" style={{ position: 'absolute', width: '290px', height: '290px', opacity: 0.6 }}>

                      {/* Crosshair target markers */}

                      <line x1="50" y1="2" x2="50" y2="8" stroke="currentColor" strokeWidth="0.8" />

                      <line x1="50" y1="92" x2="50" y2="98" stroke="currentColor" strokeWidth="0.8" />

                      <line x1="2" y1="50" x2="8" y2="50" stroke="currentColor" strokeWidth="0.8" />

                      <line x1="92" y1="50" x2="98" y2="50" stroke="currentColor" strokeWidth="0.8" />

                      

                      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="30 5" />

                    </svg>



                    {/* Glowing Circular Viewport */}

                    <div className="circular-camera-viewport">

                      {/* Live Stream Viewport (Always in DOM to prevent ref racing) */}

                      <video

                        ref={videoRef}

                        autoPlay

                        playsInline

                        muted

                        style={{

                          width: '100%',

                          height: '100%',

                          objectFit: 'cover',

                          transform: 'scaleX(-1)',

                          display: (!cameraPermissionError && cameraStream) ? 'block' : 'none'

                        }}

                      />

                      

                      {/* Standby Placeholder */}

                      {(!cameraStream || cameraPermissionError) && (

                        <div style={{

                          color: 'rgba(245, 158, 11, 0.15)',

                          transform: 'scale(4.5)'

                        }}>

                          <UserIcon />

                        </div>

                      )}



                      {/* Sweeping scan laser (Clipped to circle viewport) */}

                      {isVerifying && <div className="scan-laser kyc" />}



                      {/* Vector Facial Tracking Mesh overlay (Clipped to circle viewport) */}

                      {isVerifying && (

                        <svg className="hud-svg-overlay" viewBox="0 0 100 100">

                          <path d="M 22 40 Q 32 18 50 18 Q 68 18 78 40 Q 78 72 50 88 Q 22 72 22 40 Z" fill="none" stroke="rgba(245, 158, 11, 0.45)" strokeWidth="0.8" strokeDasharray="1 1.5" />

                          <circle cx="42" cy="42" r="3" fill="none" stroke="var(--color-warning)" strokeWidth="0.5" />

                          <line x1="38" y1="42" x2="46" y2="42" stroke="var(--color-warning)" strokeWidth="0.4" />

                          <line x1="42" y1="38" x2="42" y2="46" stroke="var(--color-warning)" strokeWidth="0.4" />

                          

                          <circle cx="58" cy="42" r="3" fill="none" stroke="var(--color-warning)" strokeWidth="0.5" />

                          <line x1="54" y1="42" x2="62" y2="42" stroke="var(--color-warning)" strokeWidth="0.4" />

                          <line x1="58" y1="38" x2="58" y2="46" stroke="var(--color-warning)" strokeWidth="0.4" />



                          <path d="M 44 65 Q 50 71 56 65" fill="none" stroke="var(--color-warning)" strokeWidth="0.8" />

                          <line x1="50" y1="60" x2="50" y2="72" stroke="rgba(245,158,11,0.2)" strokeWidth="0.5" />



                          <circle cx="50" cy="18" r="1.2" fill="#fff" />

                          <circle cx="22" cy="40" r="1.2" fill="#fff" />

                          <circle cx="78" cy="40" r="1.2" fill="#fff" />

                          <circle cx="32" cy="55" r="1.2" fill="var(--color-warning)" />

                          <circle cx="68" cy="55" r="1.2" fill="var(--color-warning)" />

                          <circle cx="50" cy="88" r="1.2" fill="#fff" />

                          <line x1="42" y1="42" x2="58" y2="42" stroke="rgba(0, 242, 254, 0.35)" strokeWidth="0.6" strokeDasharray="2 2" />

                        </svg>

                      )}



                      {/* HUD Scan Status Banner */}

                      <div style={{

                        position: 'absolute',

                        top: '16px',

                        left: '50%',

                        transform: 'translateX(-50%)',

                        fontFamily: 'var(--font-mono)',

                        fontSize: '8px',

                        color: 'var(--color-warning)',

                        display: 'flex',

                        alignItems: 'center',

                        gap: '4px',

                        background: 'rgba(0,0,0,0.85)',

                        padding: '3px 8px',

                        borderRadius: '10px',

                        border: '1px solid rgba(245, 158, 11, 0.3)',

                        whiteSpace: 'nowrap',

                        zIndex: 6

                      }}>

                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--color-warning)' }} className="pulse-animation"></span>

                        {isVerifying ? 'CAPTURING DATA' : 'CAMERA STANDBY'}

                      </div>



                    </div>

                  </div>



                  {/* Camera feed info metrics */}

                  <div style={{

                    padding: '10px 16px',

                    background: 'rgba(0,0,0,0.2)',

                    border: '1px solid rgba(255,255,255,0.02)',

                    borderRadius: '8px',

                    fontFamily: 'var(--font-mono)',

                    fontSize: '16px',

                    display: 'flex',

                    justifyContent: 'space-between',

                    color: 'var(--text-muted)',

                    width: '100%',

                    maxWidth: '320px'

                  }}>

                    <span>STREAM: 60 FPS</span>

                    <span style={{ color: isVerifying ? 'var(--color-secure)' : 'var(--text-dark)' }}>

                      LIVENESS: {isVerifying ? '99.8% OK' : 'STANDBY'}

                    </span>

                  </div>



                  {/* Camera Selection Dropdown */}

                  {videoDevices.length > 1 && (

                    <div style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>

                      <label style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>

                        ACTIVE OPTICAL SENSOR:

                      </label>

                      <select

                        value={selectedDeviceId}

                        onChange={(e) => setSelectedDeviceId(e.target.value)}

                        style={{

                          background: 'rgba(0,0,0,0.5)',

                          color: 'var(--color-warning)',

                          border: '1px solid rgba(245, 158, 11, 0.25)',

                          borderRadius: '6px',

                          padding: '6px 10px',

                          fontSize: '16px',

                          fontFamily: 'var(--font-mono)',

                          outline: 'none',

                          cursor: 'pointer',

                          width: '100%'

                        }}

                      >

                        {videoDevices.map(device => (

                          <option key={device.deviceId} value={device.deviceId} style={{ background: '#0a0c16', color: 'var(--text-main)' }}>

                            {device.label || `Camera (${device.deviceId.substring(0, 5)})`}

                          </option>

                        ))}

                      </select>

                    </div>

                  )}

                </div>



                {/* Right Column: Cinematic Face Analytics HUD */}

                <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>

                  

                  <div>

                    <h3 style={{ fontSize: '15px', marginBottom: '8px', color: 'var(--text-main)', marginTop: 0 }}>3D Facial Liveness Verification</h3>

                    <p style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: '1.5', margin: 0 }}>

                      PrismID evaluates liveness dynamically. Align your head to allow the optical sensor to map facial vectors and generate ZK credentials.

                    </p>

                  </div>



                  {/* Cinematic Face Scanning Holographic Box */}

                  <div className="cinematic-hud-panel scanline-effect" style={{ borderColor: isVerifying ? 'var(--color-warning)' : 'var(--border-color)', minHeight: '230px', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '32px' }}>

                    

                    {/* SVG 3D Hologram Face Scanner (Interactive Nodes) */}

                    <div style={{ width: '150px', height: '150px', position: 'relative', flexShrink: 0 }}>

                      <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ color: isVerifying ? 'var(--color-warning)' : 'var(--text-muted)' }}>

                        {/* Background Alignment circles */}

                        <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(245, 158, 11, 0.05)" strokeWidth="0.5" />

                        <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(245, 158, 11, 0.08)" strokeWidth="0.5" strokeDasharray="2 2" />

                        

                        {/* Compass Sweep lines */}

                        <line x1="50" y1="50" x2="50" y2="4" stroke="rgba(245, 158, 11, 0.15)" strokeWidth="0.6" className="radar-sweep" />

                        

                        {/* Face Hologram Wireframe Outline */}

                        <g className="hologram-pulse" style={{ transition: 'color 0.4s ease' }}>

                          {/* Face Shape */}

                          <path d="M 50 16 C 33 16 29 30 29 48 C 29 68 40 82 50 82 C 60 82 71 68 71 48 C 71 30 67 16 50 16 Z" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray={isVerifying ? "none" : "2 2"} />

                          

                          {/* Eyebrows */}

                          <path d="M 37 38 Q 42 35 45 38" fill="none" stroke="currentColor" strokeWidth="0.6" />

                          <path d="M 63 38 Q 58 35 55 38" fill="none" stroke="currentColor" strokeWidth="0.6" />

                          

                          {/* Eyes */}

                          <ellipse cx="40" cy="43" rx="3.5" ry="2.2" fill="none" stroke="currentColor" strokeWidth="0.6" />

                          <ellipse cx="60" cy="43" rx="3.5" ry="2.2" fill="none" stroke="currentColor" strokeWidth="0.6" />

                          

                          {/* Nose */}

                          <path d="M 50 38 L 50 56 L 47 60 L 53 60 Z" fill="none" stroke="currentColor" strokeWidth="0.6" />

                          

                          {/* Mouth */}

                          <path d="M 39 68 Q 50 75 61 68" fill="none" stroke="currentColor" strokeWidth="0.8" />

                          

                          {/* Connecting Web Mesh lines (Sci-fi wireframe effect) */}

                          <line x1="50" y1="16" x2="40" y2="38" stroke="currentColor" strokeWidth="0.3" opacity="0.2" />

                          <line x1="50" y1="16" x2="60" y2="38" stroke="currentColor" strokeWidth="0.3" opacity="0.2" />

                          <line x1="29" y1="48" x2="40" y2="43" stroke="currentColor" strokeWidth="0.3" opacity="0.2" />

                          <line x1="71" y1="48" x2="60" y2="43" stroke="currentColor" strokeWidth="0.3" opacity="0.2" />

                          <line x1="40" y1="43" x2="50" y2="56" stroke="currentColor" strokeWidth="0.3" opacity="0.2" />

                          <line x1="60" y1="43" x2="50" y2="56" stroke="currentColor" strokeWidth="0.3" opacity="0.2" />

                          <line x1="29" y1="48" x2="39" y2="68" stroke="currentColor" strokeWidth="0.3" opacity="0.2" />

                          <line x1="71" y1="48" x2="61" y2="68" stroke="currentColor" strokeWidth="0.3" opacity="0.2" />

                          <line x1="39" y1="68" x2="50" y2="82" stroke="currentColor" strokeWidth="0.3" opacity="0.2" />

                          <line x1="61" y1="68" x2="50" y2="82" stroke="currentColor" strokeWidth="0.3" opacity="0.2" />

                        </g>



                        {/* Animated Landmark Nodes */}

                        {(() => {

                          const renderNode = (cx: number, cy: number, reqProgress: number) => {

                            const isLocked = verificationProgress >= reqProgress;

                            const isPending = isVerifying && verificationProgress < reqProgress;

                            let color = "rgba(255, 255, 255, 0.18)";

                            if (isLocked) color = "var(--color-secure)";

                            else if (isPending) color = "var(--color-warning)";



                            return (

                              <circle

                                cx={cx}

                                cy={cy}

                                r={isLocked ? "1.5" : "1.1"}

                                fill={color}

                                className={isPending ? "node-pulse-active" : ""}

                                style={{

                                  transition: 'all 0.3s ease',

                                  filter: isLocked ? 'drop-shadow(0 0 3px var(--color-secure))' : isPending ? 'drop-shadow(0 0 3px var(--color-warning))' : 'none'

                                }}

                              />

                            );

                          };

                          return (

                            <g>

                              {renderNode(50, 16, 15)}  {/* Forehead */}

                              {renderNode(29, 30, 30)}  {/* Left Temple */}

                              {renderNode(71, 30, 30)}  {/* Right Temple */}

                              {renderNode(40, 43, 45)}  {/* Left Eye */}

                              {renderNode(60, 43, 45)}  {/* Right Eye */}

                              {renderNode(50, 56, 60)}  {/* Nose Tip */}

                              {renderNode(34, 56, 70)}  {/* Left Cheek */}

                              {renderNode(66, 56, 70)}  {/* Right Cheek */}

                              {renderNode(39, 68, 85)}  {/* Left Mouth Corner */}

                              {renderNode(61, 68, 85)}  {/* Right Mouth Corner */}

                              {renderNode(50, 82, 95)}  {/* Chin */}

                            </g>

                          );

                        })()}



                        {/* Horizontal Scanning laser sweep inside face profile */}

                        {isVerifying && (

                          <line x1="28" y1="0" x2="72" y2="0" stroke="var(--color-warning)" strokeWidth="1.2" className="face-laser-line" style={{ filter: 'drop-shadow(0 0 3px var(--color-warning))' }} />

                        )}

                      </svg>

                    </div>



                    {/* Numeric tracking indicators */}

                    <div style={{

                      flex: 1,

                      display: 'flex',

                      flexDirection: 'column',

                      gap: '20px',

                      fontFamily: 'var(--font-mono)',

                      fontSize: '16px',

                      color: 'var(--text-muted)'

                    }}>

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '4px' }}>

                        <span>Target ID:</span>

                        <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>HUMAN_01_SEC</span>

                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '4px' }}>

                        <span>Inter-Pupillary d:</span>

                        <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>

                          {isVerifying ? `${(63.8 + (verificationProgress/100)*0.5).toFixed(1)} mm` : '64.2 mm'}

                        </span>

                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '4px' }}>

                        <span>Symmetry Level:</span>

                        <span style={{ color: verificationProgress > 60 ? 'var(--color-secure)' : 'var(--text-main)', fontWeight: 'bold' }}>

                          {verificationProgress > 60 ? '98.4% (VERIFIED)' : 'Calibrating...'}

                        </span>

                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '4px' }}>

                        <span>Skin Refraction:</span>

                        <span style={{ color: verificationProgress > 80 ? 'var(--color-secure)' : 'var(--text-main)' }}>

                          {verificationProgress > 80 ? 'MATCHED (1.4% DEV)' : 'Analyzing...'}

                        </span>

                      </div>

                    </div>

                  </div>



                  {/* Real-time Dynamic Telemetry Scrolling Logs */}

                  <div className="terminal-ticker-container">

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(245, 158, 11, 0.15)', paddingBottom: '3px', marginBottom: '5px', fontSize: '9px', opacity: 0.8 }}>

                      <span>- BIOMETRIC INTEGRITY LEDGER</span>

                      <span style={{ color: 'var(--color-primary)' }}>{verificationProgress}% LOCKED</span>

                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'hidden' }}>

                      {(() => {

                        const tickerLogs: string[] = [];

                        tickerLogs.push(`[SYSTEM] Optical capture stream initialized at 60 FPS.`);

                        if (verificationProgress >= 15) tickerLogs.push(`[ALIGN] Grid locked. Forehead anchor coordinates mapped.`);

                        if (verificationProgress >= 30) tickerLogs.push(`[MESH] Keypoint nodes locked: 3/11 anchors aligned.`);

                        if (verificationProgress >= 45) tickerLogs.push(`[MEASURE] IPD scale factor verified: ${(63.8 + (verificationProgress/100)*0.5).toFixed(1)} mm.`);

                        if (verificationProgress >= 60) tickerLogs.push(`[LIVENESS] Node matching depth analysis: 98.4% symmetrical.`);

                        if (verificationProgress >= 70) tickerLogs.push(`[LIVENESS] Optical flow vector tracking confirmed (human).`);

                        if (verificationProgress >= 85) tickerLogs.push(`[SECURE] Generating ZK-SNARK zero-data identity proof.`);

                        if (verificationProgress >= 100) tickerLogs.push(`[SUCCESS] Liveness verified. Handshake payload dispatched.`);

                        

                        // Show only the last 5 logs to simulate scrolling within the 105px container

                        return tickerLogs.slice(-5).map((ln, idx) => (

                          <div key={idx} style={{ 

                            textOverflow: 'ellipsis', 

                            whiteSpace: 'nowrap', 

                            overflow: 'hidden',

                            opacity: idx === tickerLogs.slice(-5).length - 1 ? 1 : 0.6,

                            color: ln.includes('[SUCCESS]') ? 'var(--color-secure)' : ln.includes('[SYSTEM]') ? 'var(--color-primary)' : 'var(--color-warning)'

                          }}>

                            {ln}

                          </div>

                        ));

                      })()}

                    </div>

                  </div>



                  {/* Proving logs/loading bar */}

                  {isVerifying && renderProgressSection()}



                  {/* Actions buttons */}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {renderActionButtons()}

                    

                    <div style={{ fontSize: '14px', color: 'var(--text-dark)', fontFamily: 'var(--font-mono)', textAlign: 'center', marginTop: '4px' }}>

                      ZK-SNARK biometric signatures are evaluated on-device. Zero trust parameters.

                    </div>

                  </div>



                </div>



              </div>

            )}



          </div>

        </div>

      )}



    </div>

  );

};



