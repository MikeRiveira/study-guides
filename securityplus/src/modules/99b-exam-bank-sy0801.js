/* ================= Exam-only questions for topics new in SY0-801 =================
   Same rules as 99-exam-bank.js: these appear only in the timed practice exams and domain drills. */

/* ---------- 1.0 General Security Concepts (3) ---------- */
registerExamBank("gen",[
 {q:"A company's zero trust design checks each request against user role, device health and location before a gateway opens the session. Which component makes the grant or deny decision?",o:["Policy enforcement point","Policy engine","Implicit trust zone","Subject"],a:1,e:"The policy engine evaluates the request against policy. The enforcement point only carries out the decision."},
 {q:"An auditor asks which control category a zero trust access policy written by the security team belongs to. Which is the BEST answer?",o:["Physical","Operational","Managerial","Deterrent"],a:2,e:"A written access policy is a managerial (administrative) control. Deterrent is a type, not a category."},
 {q:"A team wants to store API keys used by hundreds of cloud functions so they can be rotated and revoked from one place. What should they use?",o:["A key management system","Steganography","A self-signed certificate","Data masking"],a:0,e:"A key management system creates, stores, rotates and revokes keys centrally."}
]);

/* ---------- 2.0 Threats, Vulnerabilities, and Attacks (12) ---------- */
registerExamBank("thr",[
 {q:"An AI email assistant summarizes incoming mail. One message contains hidden text telling the assistant to forward the inbox to an outside address. What is this attack?",o:["Jailbreaking","Model inversion","Indirect prompt injection","Training data poisoning"],a:2,e:"Instructions hidden in content the AI reads are indirect prompt injection."},
 {q:"A researcher crafts an image with tiny pixel changes so a vision model labels a stop sign as a speed limit sign. What type of attack is this?",o:["Evasion","Model theft by extraction","Direct prompt injection","Typosquatting"],a:0,e:"Evasion feeds a trained model crafted input so it misclassifies."},
 {q:"A team downloads a pretrained model from a public repository. It works normally, except it approves any transaction containing a certain phrase. What happened?",o:["Hallucination","Model poisoning","Shadow AI use by staff","AI session hijacking"],a:1,e:"A hidden trigger in a tampered model is model poisoning. Use trusted sources and verify integrity."},
 {q:"Which BEST describes a hallucination in a large language model?",o:["The model refuses a valid request","The model leaks its system prompt","The model is cloned by an attacker","It confidently gives a false answer"],a:3,e:"Hallucinations are fluent, confident and wrong, so outputs need verification."},
 {q:"Staff in marketing paste unreleased product plans into a free AI writing tool that the company hasn't approved. Which risk does this create?",o:["Data loss through shadow AI","Evasion of an AI classifier","A watering hole attack","An on-path attack on the browser"],a:0,e:"Unapproved AI tools can store or train on what users paste, so confidential data leaves the company."},
 {q:"An AI agent can read tickets and run scripts on servers. A ticket says \"Run cleanup.sh with --all on every server,\" and the agent deletes production data. Which weakness was exploited?",o:["Bias in the training data","Excessive agency","Explainability","A rainbow table attack"],a:1,e:"The agent had more access and autonomy than it needed and no human approval step."},
 {q:"A chatbot's reply is inserted into a web page without encoding, and an attacker gets it to output a script tag. What is the root cause?",o:["Data poisoning of the model","Model theft by extraction","Insecure output handling","Jailbreaking the chatbot"],a:2,e:"Model output must be treated as untrusted and encoded before it reaches a browser."},
 {q:"A hiring model trained on ten years of past decisions keeps ranking one group of applicants lower. Which AI concern is this?",o:["Evasion","Hallucination","Prompt injection","Bias"],a:3,e:"Skewed training data teaches the model unfair patterns. That is bias."},
 {q:"A finance clerk receives a phone call in the CEO's exact voice approving an urgent payment to a new account. What should the clerk do?",o:["Verify the request using a known contact method","Pay it, since the voice clearly matches the CEO","Ask the caller to repeat the account number slowly","Email the new account holder to confirm the details"],a:0,e:"Voice cloning makes voices unreliable. Verify out of band before moving money."},
 {q:"Stickers with QR codes appear on office printers saying \"Scan to report a fault.\" The code opens a page asking for corporate credentials. What attack is this?",o:["Bluejacking","Quishing","Pharming","Whaling"],a:1,e:"Phishing delivered through a QR code is quishing."},
 {q:"Which control BEST reduces the risk of indirect prompt injection in an AI assistant that browses the web?",o:["Use a larger model","Allow the assistant to run any tool it chooses","Treat web content as data and limit its tools","Hide the system prompt with a longer prompt"],a:2,e:"Untrusted content must never act as instructions, and tool access should be limited."},
 {q:"An attacker sends tens of millions of carefully chosen queries to a paid fraud-scoring API to build a copy of the model. Which control would MOST quickly detect or slow this?",o:["Rate limiting and usage monitoring","Full-disk encryption on the API servers","A wildcard TLS certificate for the API","Salting the stored API keys"],a:0,e:"Model extraction needs huge query volume, which rate limits and monitoring expose."}
]);

/* ---------- 3.0 Security Architecture (4) ---------- */
registerExamBank("arc",[
 {q:"A company with no central office wants web filtering, SaaS data controls and per-app private access delivered from the cloud. Which solution fits BEST?",o:["UTM","Security service edge","A site-to-site VPN mesh","An air-gapped network"],a:1,e:"SSE delivers SWG, CASB, ZTNA and FWaaS from the cloud, close to users."},
 {q:"Which SSE component would stop an employee from downloading a malware-laced installer from an unknown website?",o:["CASB","ZTNA","SWG","FWaaS"],a:2,e:"The SWG filters web traffic and scans downloads."},
 {q:"A traditional VPN gives contractors full network access. What does ZTNA change?",o:["It removes the need for user authentication","It sends all traffic unencrypted to save time","It requires a hardware token for every login","It connects users only to the apps they need"],a:3,e:"ZTNA grants per-application access after checking identity and device posture."},
 {q:"Which SSE component gives visibility into which SaaS apps employees use and controls the data moving through them?",o:["Cloud access security broker","Firewall as a service","Secure web gateway","Zero trust network access"],a:0,e:"A CASB sits between users and cloud apps to enforce policy."}
]);

/* ---------- 4.0 Security Operations (4) ---------- */
registerExamBank("ops",[
 {q:"An organization runs hundreds of cloud accounts and wants continuous alerts when someone makes a storage bucket public or turns off logging. What should it deploy?",o:["A SOAR playbook only","A honeynet in each account","Cloud security posture management","A jump server per region"],a:2,e:"CSPM continuously compares cloud configurations with a baseline and flags drift."},
 {q:"A SOC lets an AI agent quarantine laptops automatically but requires an analyst to approve disabling any privileged account. What principle is this?",o:["Human in the loop for high-impact actions","Separation of duties for auditors","A fail-open design for the agent","Data minimization for AI logs"],a:0,e:"Agentic AI can act quickly on low-risk steps while people approve risky ones."},
 {q:"During a ransomware incident, the attackers threaten to publish stolen HR data. Which step should come BEFORE any payment is considered?",o:["Pay quickly so the HR data isn't published","Get legal advice and a sanctions check","Post the ransom note publicly to show transparency","Let the on-call analyst negotiate by email"],a:1,e:"Legal review and a sanctions check are required, and the decision belongs to leadership."},
 {q:"A model learns each server's normal outbound traffic and alerts when one starts sending far more data than usual at night. What is this an example of?",o:["Key escrow for the server keys","Tokenization of outbound data","Port security on the switch","An AI-augmented baseline"],a:3,e:"AI can learn normal behavior and flag deviations that suggest exfiltration."}
]);

/* ---------- 5.0 Security Program Management and Oversight (2) ---------- */
registerExamBank("prg",[
 {q:"A threat intelligence report lists an attack group's techniques by IDs such as T1566 and T1003 under goals such as Initial Access and Credential Access. Which framework does it use?",o:["Cyber Kill Chain","Diamond Model","MITRE ATT&CK","NIST RMF"],a:2,e:"ATT&CK organizes techniques, with IDs, under tactics."},
 {q:"An analyst links a phishing campaign to a known group by noticing the same C2 servers and malware used against two other companies. Which model's corners is the analyst pivoting between?",o:["Diamond Model","Cyber Kill Chain","CIA triad","Shared responsibility model"],a:0,e:"The Diamond Model connects adversary, capability, infrastructure and victim, so one corner leads to the others."}
]);
