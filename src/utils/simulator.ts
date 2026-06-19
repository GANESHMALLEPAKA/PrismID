export interface TelemetrySignal {
  ipAddress: string;
  location: string;
  vpnDetected: boolean;
  deviceHash: string;
  os: string;
  browser: string;
  typingCadence: {
    speedKps: number; // Keys per second
    dwellTimeMs: number; // Average key hold time
    flightTimeMs: number; // Average time between keys
    deviation: number; // Deviation from historical pattern (0 to 1)
  };
  mouseJitter: number; // Jitter factor (0 to 1)
  velocityKmh: number; // Impossible travel speed (0 is normal)
  actionSensitivity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  privilegedAccess: boolean;
  timestamp: string;
}

export interface PrivacyGuardMetrics {
  anonymizedIp: string;
  hashedDeviceFingerprint: string;
  zkpProofHash: string;
  differentialPrivacyNoiseLevel: string;
  localProcessingOnly: boolean;
}

export interface RiskBreakdown {
  deviceRisk: number;
  networkRisk: number;
  behavioralRisk: number;
  transactionalRisk: number;
  privilegedRisk: number;
}

export interface RiskResult {
  score: number; // 0 to 100
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  breakdown: RiskBreakdown;
  recommendedAction: 'ALLOW' | 'MFA_CHALLENGE' | 'KYC_VERIFICATION' | 'BLOCK_SESSION';
  triggeredSignals: string[];
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  channel: 'WEB' | 'MOBILE' | 'INSIDER_PORTAL' | 'ATM_API';
  signals: TelemetrySignal;
  privacy: PrivacyGuardMetrics;
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'normal-customer',
    name: 'Normal Customer Session',
    description: 'Standard retail customer performing a small balance inquiry and browsing transactions on a known device.',
    channel: 'WEB',
    signals: {
      ipAddress: '192.168.1.45 (Mapped: New York, USA)',
      location: 'New York, USA',
      vpnDetected: false,
      deviceHash: 'c4ca4238a0b923820dcc509a6f75849b',
      os: 'macOS Sonoma',
      browser: 'Safari 17.2',
      typingCadence: {
        speedKps: 4.8,
        dwellTimeMs: 85,
        flightTimeMs: 120,
        deviation: 0.08
      },
      mouseJitter: 0.12,
      velocityKmh: 0,
      actionSensitivity: 'LOW',
      privilegedAccess: false,
      timestamp: new Date().toLocaleTimeString()
    },
    privacy: {
      anonymizedIp: '192.168.X.X',
      hashedDeviceFingerprint: 'sha256:8a5f3...92a1',
      zkpProofHash: 'zk-SNARK:0x7f9a2e3...b12f',
      differentialPrivacyNoiseLevel: 'ε = 0.5 (Laplacian Noise Added)',
      localProcessingOnly: true
    }
  },
  {
    id: 'account-takeover',
    name: 'Account Takeover (ATO) Attempt',
    description: 'Legitimate credential used on a new device. IP location indicates impossible velocity. Jagged mouse movements and rapid key input suggest automation or unfamiliar script usage.',
    channel: 'WEB',
    signals: {
      ipAddress: '185.220.101.4 (Mapped: Frankfurt, Germany - Tor Exit Node)',
      location: 'Frankfurt, Germany',
      vpnDetected: true,
      deviceHash: 'e4da3b7fbc2c423820dcc509a6f7507e',
      os: 'Linux x86_64',
      browser: 'Chrome 126.0 (Headless)',
      typingCadence: {
        speedKps: 12.4, // Extremely high, typical of automation/copy-paste
        dwellTimeMs: 15,
        flightTimeMs: 30,
        deviation: 0.85 // High deviation
      },
      mouseJitter: 0.78, // High jitter/jagged movement
      velocityKmh: 820, // Real user was in NY 10 minutes ago
      actionSensitivity: 'HIGH', // Trying to add new transfer recipient
      privilegedAccess: false,
      timestamp: new Date().toLocaleTimeString()
    },
    privacy: {
      anonymizedIp: '185.220.X.X',
      hashedDeviceFingerprint: 'sha256:d13e7...ff02',
      zkpProofHash: 'zk-SNARK:0x22ab8e4...e881',
      differentialPrivacyNoiseLevel: 'ε = 0.5 (Privacy Shield Triggered)',
      localProcessingOnly: false
    }
  },
  {
    id: 'kyc-fraud',
    name: 'Suspicious Mobile Onboarding',
    description: 'Onboarding session using an emulator and mismatched details. Synthetic identity patterns detected along with a masked location.',
    channel: 'MOBILE',
    signals: {
      ipAddress: '102.165.32.12 (Mapped: Lagos, Nigeria)',
      location: 'Lagos, Nigeria',
      vpnDetected: true,
      deviceHash: '8f14e45fbc2c423820dcc509a6f7566a',
      os: 'Android 11 (Emulator-vbox86)',
      browser: 'Mobile Banking App v4.2.1',
      typingCadence: {
        speedKps: 1.2, // Very slow, mimicking manual entry of synthetic details from a cheat sheet
        dwellTimeMs: 190,
        flightTimeMs: 400,
        deviation: 0.65
      },
      mouseJitter: 0.35,
      velocityKmh: 0,
      actionSensitivity: 'HIGH', // Account Opening
      privilegedAccess: false,
      timestamp: new Date().toLocaleTimeString()
    },
    privacy: {
      anonymizedIp: '102.165.X.X',
      hashedDeviceFingerprint: 'sha256:b590e...a713',
      zkpProofHash: 'zk-SNARK:0xfa112e7...bba0',
      differentialPrivacyNoiseLevel: 'ε = 0.25 (Enhanced Protection)',
      localProcessingOnly: true
    }
  },
  {
    id: 'privileged-abuse',
    name: 'Privileged Insider Misuse',
    description: 'Database administrator access from an unapproved endpoint at an unusual time, executing massive database query/export commands.',
    channel: 'INSIDER_PORTAL',
    signals: {
      ipAddress: '198.51.100.72 (Mapped: Home VPN Portal)',
      location: 'San Jose, USA',
      vpnDetected: true,
      deviceHash: '7a7a3b7fbc2c423820dcc509a6f75aa1',
      os: 'Windows 11 Enterprise',
      browser: 'PowerShell / Terminal SSH Client',
      typingCadence: {
        speedKps: 6.2,
        dwellTimeMs: 70,
        flightTimeMs: 95,
        deviation: 0.42 // Moderate deviation from employee baseline
      },
      mouseJitter: 0.05, // Commands are typed, no mouse activity
      velocityKmh: 0,
      actionSensitivity: 'CRITICAL', // Bulk User DB Export
      privilegedAccess: true,
      timestamp: new Date().toLocaleTimeString()
    },
    privacy: {
      anonymizedIp: '198.51.X.X',
      hashedDeviceFingerprint: 'sha256:cf28d...00aa',
      zkpProofHash: 'zk-SNARK:0x88bb7e2...fd18',
      differentialPrivacyNoiseLevel: 'Audit Logging Active (No DP for Admins)',
      localProcessingOnly: false
    }
  },
  {
    id: 'custom-playground',
    name: 'Custom Testing Playground 🛠️',
    description: 'Manually adjust telemetry signals using slider controls below to test the Continuous Risk Engine limits and trigger step-up responses.',
    channel: 'WEB',
    signals: {
      ipAddress: '127.0.0.1 (Local Loopback)',
      location: 'Custom Session',
      vpnDetected: false,
      deviceHash: 'c4ca4238a0b923820dcc509a6f75849b',
      os: 'Custom Agent',
      browser: 'Custom Browser',
      typingCadence: {
        speedKps: 5.0,
        dwellTimeMs: 80,
        flightTimeMs: 110,
        deviation: 0.10
      },
      mouseJitter: 0.10,
      velocityKmh: 0,
      actionSensitivity: 'LOW',
      privilegedAccess: false,
      timestamp: new Date().toLocaleTimeString()
    },
    privacy: {
      anonymizedIp: '127.0.0.X',
      hashedDeviceFingerprint: 'sha256:custom...',
      zkpProofHash: 'zk-SNARK:0xcustom...',
      differentialPrivacyNoiseLevel: 'ε = 0.5 (Interactive Noise)',
      localProcessingOnly: true
    }
  }
];

export function calculateRisk(signal: TelemetrySignal): RiskResult {
  const triggeredSignals: string[] = [];
  
  // 1. Device Risk (Max 20 pts)
  let deviceRisk = 0;
  // Known baseline device hash in scenario 0 is 'c4ca4238a0b923820dcc509a6f75849b'
  if (signal.deviceHash !== 'c4ca4238a0b923820dcc509a6f75849b') {
    deviceRisk += 12;
    triggeredSignals.push('Unrecognized Device Fingerprint');
  }
  if (signal.os.includes('Emulator') || signal.browser.includes('Headless')) {
    deviceRisk += 8;
    triggeredSignals.push('Virtual Environment / Emulator Detected');
  }

  // 2. Network & Velocity Risk (Max 25 pts)
  let networkRisk = 0;
  if (signal.vpnDetected) {
    networkRisk += 8;
    triggeredSignals.push('VPN / Proxy Connection Active');
  }
  if (signal.velocityKmh > 500) {
    networkRisk += 17;
    triggeredSignals.push(`Impossible Travel Speed (${signal.velocityKmh} km/h)`);
  } else if (signal.velocityKmh > 100) {
    networkRisk += 8;
    triggeredSignals.push('Suspicious Location Shift Velocity');
  }

  // 3. Behavioral Risk (Max 25 pts)
  let behavioralRisk = 0;
  // Typing speed anomaly
  if (signal.typingCadence.speedKps > 10) {
    behavioralRisk += 10;
    triggeredSignals.push('Automated Script Input Pattern');
  } else if (signal.typingCadence.deviation > 0.5) {
    behavioralRisk += 8;
    triggeredSignals.push('High Typing Cadence Deviation');
  }
  
  // Mouse movement anomaly
  if (signal.mouseJitter > 0.7) {
    behavioralRisk += 10;
    triggeredSignals.push('Unnatural Mouse Jitter (Bot Signature)');
  } else if (signal.mouseJitter > 0.4) {
    behavioralRisk += 5;
    triggeredSignals.push('Anomalous Cursor Coordination');
  }

  // 4. Transaction/Action Sensitivity Risk (Max 15 pts)
  let transactionalRisk = 0;
  if (signal.actionSensitivity === 'HIGH') {
    transactionalRisk += 10;
    triggeredSignals.push('High-Value Transfer / Recipient Add Attempt');
  } else if (signal.actionSensitivity === 'CRITICAL') {
    transactionalRisk += 15;
    triggeredSignals.push('Critical System Command Execution');
  } else if (signal.actionSensitivity === 'MEDIUM') {
    transactionalRisk += 5;
  }

  // 5. Privileged Access Risk (Max 15 pts)
  let privilegedRisk = 0;
  if (signal.privilegedAccess) {
    privilegedRisk += 10;
    triggeredSignals.push('Privileged Credential Authorization');
    // If Admin accesses at unusual times (night, etc.) or from VPN
    if (signal.vpnDetected || signal.typingCadence.deviation > 0.3) {
      privilegedRisk += 5;
      triggeredSignals.push('Suspicious Admin Access Windows');
    }
  }

  const score = Math.min(100, deviceRisk + networkRisk + behavioralRisk + transactionalRisk + privilegedRisk);
  
  let level: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (score >= 70) {
    level = 'HIGH';
  } else if (score >= 30) {
    level = 'MEDIUM';
  }

  let recommendedAction: 'ALLOW' | 'MFA_CHALLENGE' | 'KYC_VERIFICATION' | 'BLOCK_SESSION' = 'ALLOW';
  if (score >= 80) {
    recommendedAction = 'BLOCK_SESSION';
  } else if (score >= 70) {
    recommendedAction = 'KYC_VERIFICATION';
  } else if (score >= 30) {
    recommendedAction = 'MFA_CHALLENGE';
  }

  return {
    score,
    level,
    breakdown: {
      deviceRisk,
      networkRisk,
      behavioralRisk,
      transactionalRisk,
      privilegedRisk
    },
    recommendedAction,
    triggeredSignals: triggeredSignals.length > 0 ? triggeredSignals : ['Standard session signals within limits']
  };
}
