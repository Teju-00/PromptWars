export const INITIAL_TIMELINE = [
  { id: 'step-1', order: 1, phase: 'Eligibility', title: 'Verify Eligibility', description: 'Check if you are eligible to vote in India.', detailedInfo: 'Must be an Indian citizen, 18+ years old, and of sound mind.' },
  { id: 'step-2', order: 2, phase: 'Registration', title: 'Voter Registration', description: 'Register on the National Voter Service Portal (NVSP).', detailedInfo: 'Fill Form 6 to register as a new voter.' },
  { id: 'step-3', order: 3, phase: 'Campaign', title: 'Know Your Candidate', description: 'Research candidates and their manifestos.', detailedInfo: 'Use ECI apps like KYC (Know Your Candidate) to see affidavits.' },
  { id: 'step-4', order: 4, phase: 'Voting', title: 'Polling Day', description: 'Go to your assigned booth and cast your vote.', detailedInfo: 'Carry your EPIC card or alternative photo ID.' },
];

export const INITIAL_QUIZ = [
  { 
    id: 'q1', 
    category: 'Basics',
    difficulty: 'Easy',
    question: 'What is the minimum age to vote in Indian Lok Sabha elections?', 
    question_hi: 'भारतीय लोकसभा चुनाव में मतदान करने के लिए न्यूनतम आयु क्या है?',
    question_te: 'భారత లోక్‌సభ ఎన్నికల్లో ఓటరుకు ఉండాల్సిన కనీస వయస్సు ఎంత?',
    options: ['16', '18', '21', '25'], 
    options_hi: ['16', '18', '21', '25'],
    options_te: ['16', '18', '21', '25'],
    correctAnswerIndex: 1, 
    explanation: 'The voting age was reduced from 21 to 18 by the 61st Amendment Act in 1988.',
    explanation_hi: '1988 में 61वें संशोधन अधिनियम द्वारा मतदान की आयु 21 से घटाकर 18 कर दी गई थी।',
    explanation_te: '1988లో 61వ సవరణ చట్టం ద్వారా ఓటింగ్ వయస్సు 21 నుండి 18కి తగ్గించబడింది.'
  },
  { 
    id: 'q2', 
    category: 'EVM/VVPAT',
    difficulty: 'Medium',
    question: 'What does VVPAT stand for?', 
    question_hi: 'VVPAT का पूर्ण रूप क्या है?',
    question_te: 'VVPAT అంటే ఏమిటి?',
    options: ['Voter Verifiable Paper Audit Trail', 'Voter Verification Paper Account Tool', 'Voting Verification Paper Audit Test', 'Voter Validated Paper Audit Trail'], 
    options_hi: ['वोटर वेरिफ़िएबल पेपर ऑडिट ट्रेल', 'वोटर वेरिफिकेशन पेपर अकाउंट टूल', 'वोटिंग वेरिफिकेशन पेपर ऑडिट टेस्ट', 'वोटर वैलिडेटेड पेपर ऑडिट ट्रेल'],
    options_te: ['ఓటర్ వెరిఫైబుల్ పేపర్ ఆడిట్ ట్రయల్', 'ఓటర్ వెరిఫికేషన్ పేపర్ అకౌంట్ టూల్', 'ఓటింగ్ వెరిఫికేషన్ పేపర్ ఆడిట్ టెస్ట్', 'ఓటర్ వాలిడేటెడ్ పేపర్ ఆడిట్ ట్రయల్'],
    correctAnswerIndex: 0, 
    explanation: 'VVPAT allows voters to verify that their vote was cast correctly via a printed slip.',
    explanation_hi: 'VVPAT मतदाताओं को यह सत्यापित करने की अनुमति देता है कि उनका वोट एक मुद्रित पर्ची के माध्यम से सही ढंग से डाला गया था।',
    explanation_te: 'ఓటరు తాను వేసిన ఓటు సరైన అభ్యర్థికే పడిందో లేదో ప్రింటెడ్ స్లిప్ ద్వారా VVPAT సహాయంతో చూసుకోవచ్చు.'
  },
  { 
    id: 'q4', 
    category: 'Basics',
    difficulty: 'Easy',
    question: 'How often are general elections for the Lok Sabha normally held in India?', 
    question_hi: 'भारत में सामान्य रूप से लोकसभा के लिए आम चुनाव कितने समय में होते हैं?',
    question_te: 'భారతదేశంలో లోక్‌సభకు సాధారణ ఎన్నికలు సాధారణంగా ఎన్ని సంవత్సరాలకు ఒకసారి జరుగుతాయి?',
    options: ['Every 4 years', 'Every 5 years', 'Every 6 years', 'Decided by the President'], 
    options_hi: ['हर 4 साल', 'हर 5 साल', 'हर 6 साल', 'राष्ट्रपति द्वारा तय'],
    options_te: ['ప్రతి 4 ఏళ్లకు', 'ప్రతి 5 ఏళ్లకు', 'ప్రతి 6 ఏళ్లకు', 'రాష్ట్రపతి నిర్ణయిస్తారు'],
    correctAnswerIndex: 1, 
    explanation: 'General elections are held every 5 years unless the Lok Sabha is dissolved earlier.',
    explanation_hi: 'लोकसभा भंग न होने की स्थिति में हर 5 साल में आम चुनाव होते हैं।',
    explanation_te: 'లోక్‌సభ ముందే రద్దు కాకపోతే ప్రతి 5 సంవత్సరాలకు ఒకసారి సాధారణ ఎన్నికలు జరుగుతాయి.'
  }
];

export const INITIAL_MYTHS = [
  { id: 'm1', myth: 'Aadhaar is mandatory for voting.', fact: 'False. While Aadhaar can be used for identity verification, it is NOT mandatory. Several other photo IDs are accepted.' },
  { id: 'm2', myth: 'If my name is in the voter list, I can vote without any ID.', fact: 'False. You must have your Voter ID (EPIC) or any of the 12 alternative documents prescribed by ECI.' }
];
