import fs from 'fs';
import PDFDocument from 'pdfkit';

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 40, bottom: 40, left: 45, right: 45 }
});

const outputPath = 'AgriSmart_Hackathon_Submission_Dossier.pdf';
const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Styling constants
const PRIMARY_COLOR = '#0d2818';
const ACCENT_COLOR = '#16a34a';
const SECONDARY_COLOR = '#1e293b';
const TEXT_MUTED = '#64748b';
const BG_CARD = '#f8fafc';

function addHeader(title, subtitle) {
  doc.rect(45, doc.y, 505, 70).fill(PRIMARY_COLOR);
  doc.fillColor('#ffffff').fontSize(18).font('Helvetica-Bold').text(title, 60, doc.y - 55);
  doc.fillColor('#86efac').fontSize(10).font('Helvetica').text(subtitle, 60, doc.y + 4);
  doc.moveDown(2);
}

function addSectionTitle(number, title) {
  doc.moveDown(0.8);
  doc.fillColor(ACCENT_COLOR).fontSize(14).font('Helvetica-Bold').text(`${number}. ${title}`);
  doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(45, doc.y + 3).lineTo(550, doc.y + 3).stroke();
  doc.moveDown(0.6);
}

function addField(label, value) {
  doc.fillColor(SECONDARY_COLOR).fontSize(10).font('Helvetica-Bold').text(label + ': ', { continued: true });
  doc.fillColor('#334155').font('Helvetica').text(value);
  doc.moveDown(0.4);
}

function addBullet(label, text) {
  doc.fillColor(ACCENT_COLOR).fontSize(10).font('Helvetica-Bold').text('• ' + label + ': ', { continued: true });
  doc.fillColor('#334155').font('Helvetica').text(text);
  doc.moveDown(0.4);
}

// COVER / HEADER
addHeader(
  'AgriSmart (SQUADX) — Hackathon Submission Dossier',
  'Earth Observation Agro-Intelligence, Decentralized Blockchain & Native Android APK'
);

// REPOSITORY & DEPLOYMENT LINKS
doc.fillColor(SECONDARY_COLOR).fontSize(11).font('Helvetica-Bold').text('Project Links & Access Points:');
doc.moveDown(0.3);
addField('Live Web Application (Vercel)', 'https://nasa-squad-x.vercel.app');
addField('Vercel 1-Click Deploy', 'https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frupeshpatil14042006-cpu%2Fnasa-squad-x');
addField('GitHub Repository', 'https://github.com/rupeshpatil14042006-cpu/nasa-squad-x.git');
addField('Native Android APK', 'AgriSmart-Kisan-v2.6.apk (19.6 MB, Gradle 8.14 & Java 21)');
addField('Security Posture Score', '99/100 (Grade A+ · OWASP Top 10 & LLM01 Hardened)');
doc.moveDown(0.8);

// SECTION 3
addSectionTitle('3', 'Problem Statement');
addBullet('The Problem', 'Smallholder and commercial farmers face catastrophic crop loss and income instability caused by climate shocks (droughts, erratic monsoons) and lack of accessible parcel-level soil intelligence. In addition, the agricultural supply chain suffers from middleman exploitation, unverified harvest claims, and delayed disaster insurance payouts taking 6-12 months.');
addBullet('Who is Affected', 'Over 500 million smallholder farming families globally, agricultural cooperatives, agro-exporters requiring certified organic provenance, and crop insurance underwriters.');
addBullet('Why it Matters', 'Agricultural climate volatility inflicts over $120B in annual losses globally. A single failed season pushes farmers into predatory debt cycles. Providing free satellite telemetry and trustless parametric disaster relief delivers immediate food security and financial resilience.');
addBullet('Existing Solutions & Gaps', 'Traditional precision farming requires expensive tractor hardware or multi-thousand dollar IoT probes that smallholders cannot afford. Generic weather apps lack parcel-specific soil chemistry or crop advisory, and current supply chains lack cryptographic provenance and automated smart contract relief.');

// SECTION 4
addSectionTitle('4', 'Proposed Solution');
addField('Overview', 'AgriSmart is an end-to-end precision agro-intelligence and Web3 platform fusing NASA Earth Observations (POWER, Landsat-8/9 STAC, ISRIC SoilGrids) with Machine Learning and Solidity Smart Contracts. Available as both a responsive web dashboard and an offline-ready native Android APK, AgriSmart provides auto-GPS soil telemetry, 3D digital field twins, AI leaf disease diagnostics, tamper-evident crop provenance, and instant parametric climate relief.');
addField('Unique Value', 'Democratizes free NASA/USGS space agency data directly to smartphones in local languages (English, Hindi, Marathi). Couples satellite vegetation tracking (NDVI) with Solidity smart contracts for instant, zero-paperwork parametric insurance payouts and satellite MRV carbon credit rewards.');

doc.addPage();

// KEY FEATURES
doc.fillColor(SECONDARY_COLOR).fontSize(11).font('Helvetica-Bold').text('Key Features:');
doc.moveDown(0.3);
addBullet('Feature 1: Satellite Sensing & 3D Digital Twin', 'Draw farm parcels with Leaflet-Geoman, analyze 30m Landsat-9 NDVI vegetation indices, inspect ISRIC SoilGrids 250m profiles (pH, organic carbon, moisture), and simulate 3D terrain elevation meshes via Three.js.');
addBullet('Feature 2: Decentralized Blockchain & Parametric Insurance', 'Cryptographic SHA-256 Merkle hash chain with interactive Tamper Detection Simulator. Solidity contracts (AgriSmartLedger.sol, ParametricCropInsurance.sol) automate relief payouts ($50k escrow pool) when NASA dry spell > 14 days or rainfall deficit > 40%.');
addBullet('Feature 3: Kisan Mobile App (Native Android APK) & AI Crop Doctor', 'Standalone 19.6 MB APK with hardware GPS, 24h pesticide spraying windows, leaf camera pathology scanner (Early Blight, Rice Blast), live APMC Mandi rates, and hands-free multilingual voice advisory.');
addField('Out of Scope (For Now)', 'Autonomous drone spraying robotics, physical chemical spectroscopy kits, and traditional fiat banking gateways (MVP relies on decentralized Web3 USDC/ETH escrow smart contracts).');

// SECTION 5
addSectionTitle('5', 'Technical Architecture & Data Flow');
addField('Frontend & Mobile', 'React 19, Vite 8, Tailwind CSS v4, Lucide Icons, Capacitor Android Bridge, Gradle 8.14, Java 21.');
addField('Spatial & 3D Graphics', 'Leaflet 1.9, Leaflet-Geoman, Esri Satellite World Imagery, Three.js Digital Twin.');
addField('Backend & Data Pipeline', 'Python 3.11, FastAPI, NASA POWER API, Microsoft Planetary Computer STAC, ISRIC SoilGrids 250m, Open-Meteo, Scikit-learn.');
addField('Blockchain & Security', 'Solidity 0.8.20 (EVM), SHA-256 Merkle Trees, Web Crypto HMAC-SHA256 SecureStorage, OWASP LLM01 AI Prompt Injection Firewall.');
doc.moveDown(0.3);
doc.fillColor(SECONDARY_COLOR).fontSize(10).font('Helvetica-Bold').text('Data Flow Pipeline:');
doc.fillColor('#334155').fontSize(9).font('Helvetica').text(
  '1. Auto-GPS coordinates locked via mobile APK / browser.\n' +
  '2. NASA POWER 90-day meteorological data and Landsat-9 NDVI scenes ingested asynchronously.\n' +
  '3. Agronomic decision engine computes soil moisture, 24h spraying window, and crop rotation.\n' +
  '4. Telemetry and harvest batches hashed into Merkle roots and pinned to AgriSmartLedger.sol.\n' +
  '5. If drought/heat thresholds are breached, oracle triggers automated payout on ParametricCropInsurance.sol.'
);

// SECTION 6
addSectionTitle('6', 'Feature Tracker');
const features = [
  ['AgriSmart Web Dashboard', 'Full-Stack Team', 'High', 'DONE', 'KPI metrics, Leaflet parcel mapping, live weather'],
  ['3D Field Twin Simulation', 'Frontend Lead', 'Medium', 'DONE', 'Three.js elevation terrain mesh & solar simulation'],
  ['NASA POWER & Landsat STAC', 'Backend Lead', 'High', 'DONE', 'Asynchronous solar, precipitation & NDVI time-series'],
  ['AI Crop Doctor Scanner', 'AI/ML Lead', 'High', 'DONE', 'Leaf pathology diagnostics with organic remedies'],
  ['Multilingual Voice Advisor', 'AI Lead', 'High', 'DONE', 'Speech-to-text & audio in English, Hindi, Marathi'],
  ['Blockchain Ledger & Merkle', 'Web3 Lead', 'High', 'DONE', 'SHA-256 Merkle chain with tamper detection simulator'],
  ['Parametric Crop Insurance', 'Web3 Lead', 'High', 'DONE', 'Smart contract oracle payout trigger ($50k pool)'],
  ['Satellite MRV Carbon Credits', 'Web3 Lead', 'Medium', 'DONE', 'AGRI-CARBON ERC-20 token minted when NDVI >= 0.65'],
  ['Enterprise Security & Firewall', 'Security Lead', 'High', 'DONE', 'OWASP LLM01 prompt firewall, anti-DDoS rate limiting'],
  ['Native Android APK', 'Mobile Lead', 'High', 'DONE', 'AgriSmart-Kisan-v2.6.apk (19.6 MB, Gradle 8.14)']
];

features.forEach(([feat, owner, prio, status, notes]) => {
  doc.fillColor(SECONDARY_COLOR).fontSize(9).font('Helvetica-Bold').text(`• ${feat}`, { continued: true });
  doc.fillColor(ACCENT_COLOR).font('Helvetica-Bold').text(` [${status}]`, { continued: true });
  doc.fillColor(TEXT_MUTED).font('Helvetica').text(` — Owner: ${owner} | Priority: ${prio} | ${notes}`);
});

doc.addPage();

// SECTION 9
addSectionTitle('9', 'Challenges and Solutions');
addBullet('Challenge 1: High-res satellite latency on rural 3G networks', 'Raw Landsat-9 STAC scenes and 90-day NASA observations generated ~15MB payloads. Solved by creating a server-side FastAPI polygon-clipping pipeline that computes NDVI band math server-side, reducing client payload to <180KB with offline caching in SecureStorage.');
addBullet('Challenge 2: Immutability without high blockchain gas fees', 'Writing every sensor log to Ethereum cost excessive gas. Solved with a hybrid model: telemetry is batched into SHA-256 Merkle Trees off-chain, and only daily Merkle roots are committed to AgriSmartLedger.sol.');
addBullet('Challenge 3: AI prompt injection & system jailbreaks (OWASP LLM01)', 'Voice assistant was vulnerable to prompt injection exploits. Solved by building an intelligent sanitizeAndInspectQuery regex firewall that intercepts adversarial payloads and enforces strict domain safety boundaries.');
addBullet('Challenge 4: Wrapping React 19 SPA into native Android APK', 'Three.js 3D meshes and hardware GPS required native tuning. Solved by integrating Capacitor, configuring Gradle 8.14 with Java 21, and enabling WebGL hardware acceleration in Android webview, outputting a 19.6 MB standalone APK.');

// SECTION 10
addSectionTitle('10', 'Testing and Setup Notes');
addField('Local Setup', '1. git clone https://github.com/rupeshpatil14042006-cpu/nasa-squad-x.git\n2. npm install && pip install -r backend/requirements.txt\n3. cp .env.example .env\n4. npm run dev (http://localhost:5173/) or uvicorn backend.main:app --reload');
addField('Testing Approach', 'Automated end-to-end browser subagent workflows, Vite production bundle verification (npm run build), cryptographic tamper-detection testing (simulated block mutation & consensus recovery), and REST security posture validation (GET /api/security/audit: 99/100 Grade A+).');
addField('Known Issues', 'Voice speech synthesis depends on browser Web Speech API (Chrome/Edge recommended). NASA POWER satellite feeds have a standard 24-48hr raw telemetry ingestion lag (handled via 7-day rolling window interpolation).');
addField('Test Accounts & Sample Data', 'Farmer Alice (0x71C8...649A), NASA Crop Auditor (0x3B2e...cfF12), Climate Oracle DAO ($50,000 USDC Escrow Custodian). Pre-loaded parcels: Field A (Rice, Landsat NDVI 0.74), Field B (Vegetables), Field C (Orchard). 1-Click Demo Login available in Auth Modal.');

doc.end();

writeStream.on('finish', () => {
  console.log('PDF generation complete:', outputPath);
});
