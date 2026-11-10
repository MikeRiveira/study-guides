# Study Guides

Free, interactive study guides that run in any browser. No sign-up, no install.

**Start here: [IT career roadmap](https://mikeriveira.github.io/study-guides/).** Answer three questions to get a recommended first cert, see where each cert leads (help desk, networking, cloud, security), and track your progress across every guide. The roadmap is the root `index.html`, a single self-contained page with no build step.

| Guide | Live site |
|---|---|
| CompTIA A+ (Core 1 220-1201, Core 2 220-1202) | https://mikeriveira.github.io/study-guides/aplus/ |
| CompTIA Network+ (N10-009) | https://mikeriveira.github.io/study-guides/netplus/ |
| CompTIA Security+ (SY0-701) | https://mikeriveira.github.io/study-guides/securityplus/ |
| Microsoft Azure Fundamentals (AZ-900) | https://mikeriveira.github.io/study-guides/az900/ |
| Cisco CCNA (200-301 v2.0) | https://mikeriveira.github.io/study-guides/ccna/ |
| CompTIA CySA+ (CS0-004) | https://mikeriveira.github.io/study-guides/cysaplus/ |
| IT quick reference cheat sheets | https://mikeriveira.github.io/study-guides/cheatsheets/ |

## CompTIA A+ study guide

Nine modules, one for each exam domain:

| Core 1 (220-1201) | Core 2 (220-1202) |
|---|---|
| 1. Mobile Devices | 6. Operating Systems |
| 2. Networking | 7. Security |
| 3. Hardware | 8. Software Troubleshooting |
| 4. Virtualization and Cloud Computing | 9. Operational Procedures |
| 5. Hardware and Network Troubleshooting | |

Every module has:

- **Lessons** with interactive diagrams (44 in total), such as a subnet calculator, a laser printing animation, a phishing email inspector and a backup scheme simulator
- **Hands-on simulations** (26 in total) modeled on performance-based questions, like configuring a SOHO router or setting up a malware analysis VM
- **Spaced-repetition flashcards** (365 in total)
- **A practice quiz** with explanations (390 questions in total)

There's also a **timed practice exam** for each core, with 90 questions in 90 minutes (or a 45-question half exam), weighted by domain like the real exam, with a score breakdown by domain.

A **level-up system** tracks progress: XP for real milestones, 10 IT career ranks, daily streaks and 60+ badges. Progress is saved in your browser only.

### Editing the A+ guide

The page is built from source files in `aplus/src/`:

- `shell.html`: page skeleton
- `style.css`: all styles
- `engine.js`: routing, XP, flashcards, quizzes and practice exams
- `modules/NN-name.js`: one file per module (lessons, cards, questions, diagrams, simulations, badges)

After editing, rebuild the page:

```
python3 aplus/build.py
```

This writes `aplus/index.html`, which is the file GitHub Pages serves.

## CompTIA Network+ study guide

Five modules, one for each N10-009 exam domain:

| Module | Exam weight |
|---|---|
| 1. Networking Concepts | 23% |
| 2. Network Implementation | 20% |
| 3. Network Operations | 19% |
| 4. Network Security | 14% |
| 5. Network Troubleshooting | 24% |

It has 36 lessons with 41 interactive diagrams (such as an OSI encapsulation builder, a spanning tree election, an ACL rule-order puzzle and a command-line simulator), 20 hands-on simulations, 337 spaced-repetition flashcards, 278 quiz questions, and a timed practice exam (90 questions in 90 minutes, or a 45-question half exam) weighted by domain. It uses the same level-up system as the A+ guide, with its own network career ranks. Progress is kept separately from the A+ guide.

The page is built from `netplus/src/` in the same way as the A+ guide. After editing, run:

```
python3 netplus/build.py
```

## CompTIA Security+ study guide

Five modules, one for each SY0-701 exam domain:

| Module | Exam weight |
|---|---|
| 1. General Security Concepts | 12% |
| 2. Threats, Vulnerabilities, and Mitigations | 22% |
| 3. Security Architecture | 18% |
| 4. Security Operations | 28% |
| 5. Security Program Management and Oversight | 20% |

It has 39 lessons with 59 interactive diagrams (such as a live SHA-256 avalanche demo, a SQL injection sandbox, a ransomware outbreak lab, a CVSS calculator, a SIEM triage console, an SPF/DKIM/DMARC checker and an ALE calculator), 20 hands-on simulations, 410 spaced-repetition flashcards, 284 quiz questions, and a timed practice exam (90 questions in 90 minutes, or a 45-question half exam) weighted by domain and scored against the 750 passing score. It uses the same level-up system as the other guides, with security career ranks from SOC Trainee to Security+ Master and 69 badges. Progress is kept separately from the A+ and Network+ guides.

The page is built from `securityplus/src/` in the same way as the other guides. After editing, run:

```
python3 securityplus/build.py
```

## Microsoft Azure Fundamentals (AZ-900) study guide

Three modules, one for each AZ-900 exam domain (skills measured as of July 20, 2026):

| Module | Exam weight |
|---|---|
| 1. Cloud Concepts | 25–30% |
| 2. Azure Architecture and Services | 35–40% |
| 3. Azure Management and Governance | 30–35% |

It has 36 lessons with 63 interactive diagrams (such as a shared responsibility explorer, a CapEx vs OpEx chart, an SLA calculator, a region pair map, an availability zone failure simulator, a hybrid network builder, a storage redundancy outage simulator, a Conditional Access evaluator, an Azure Policy lab, a resource lock tester and a Cloud Shell lab), 16 hands-on simulations, 306 spaced-repetition flashcards, 228 quiz questions, and a timed practice exam (50 questions in 45 minutes, or a 25-question half exam) weighted by domain and scored against the 700 passing score. It uses the same level-up system as the other guides, with cloud career ranks from Cloud Trainee to Azure Fundamentals Master and 69 badges. Progress is kept separately from the other guides.

The page is built from `az900/src/` in the same way as the other guides. After editing, run:

```
python3 az900/build.py
```

## Cisco CCNA study guide

Five modules, one for each domain of the CCNA 200-301 v2.0 exam:

| Module | Exam weight |
|---|---|
| 1. Network Infrastructure and Connectivity | 25% |
| 2. Switching and Network Access | 25% |
| 3. IP Routing | 20% |
| 4. Network Services and Security | 20% |
| 5. Network Operations and Automation | 10% |

The signature feature is a **simulated Cisco IOS command line**. It has user, privileged and configuration modes, abbreviations, `?` help, Tab completion, `show` commands and a live network model behind it, so OSPF neighbors form, spanning tree blocks ports, NAT builds translations, ACLs drop pings and port security err-disables ports as you type. 16 hands-on labs and 7 mini labs in the lessons use it, from addressing a router to troubleshooting OSPF, building EtherChannels, PAT and DHCP snooping.

It has 34 lessons with 77 interactive diagrams (such as a MAC learning animation, a spanning tree election, a longest prefix match explorer, an OSPF DR election, a PAT table, an ACL evaluator and an AI prompt builder), 26 simulations, 520 spaced-repetition flashcards, 271 quiz questions, and a timed practice exam (100 questions in 120 minutes, or a 50-question half exam) weighted by domain. Cisco doesn't publish a passing score, so the exam is scored on a 300–1000 scale against an unofficial target of 825. It uses the same level-up system as the other guides, with network engineering ranks from Network Apprentice to CCNA Master and 69 badges. Progress is kept separately from the other guides.

The page is built from `ccna/src/` in the same way as the other guides, plus `ccna/src/ios/` for the command-line simulator. After editing, run:

```
python3 ccna/build.py
```

## IT quick reference cheat sheets

Twelve printable cheat sheets on one page: ports and protocols (filterable by exam, with a port drill), subnetting (CIDR table and a live subnet calculator), the OSI and TCP/IP models, Windows, Linux and Cisco IOS commands (click any command to copy it), nearly 250 acronyms, the CompTIA troubleshooting method, Wi-Fi standards, cables and connectors (with T568A/B pinouts), RAID levels (with a capacity calculator) and attacks matched to their defenses. A search box finds any port, command or acronym across every sheet. **Print this sheet** and **Print all** switch to a compact black-on-white layout, one sheet per page.

Each sheet has its own link, such as `cheatsheets/#ports` or `cheatsheets/#ios`. The page is built from `cheatsheets/src/` (`data.js` holds all the content, `app.js` the page logic). After editing, run:

```
python3 cheatsheets/build.py
```

## CompTIA CySA+ study guide

Four modules, one for each domain of the CS0-004 exam (launched June 23, 2026; the English CS0-003 exam retires December 22, 2026):

| Module | Exam weight |
|---|---|
| 1. Security Operations | 34% |
| 2. Vulnerability Management | 26% |
| 3. Incident Response and Management | 24% |
| 4. Reporting and Communication | 16% |

The signature feature is a **simulated SOC analyst console** used across all four modules: a command-line terminal with real `grep`, `awk`, `sort`, `uniq`, `cut` and pipes over generated logs (SSH brute force, proxy beacon hunting, scanner exports, Volatility memory forensics), a packet capture viewer with display filters, alert and finding triage queues, and branching incident playbooks (ransomware and business email compromise).

It has 35 lessons with 58 interactive diagrams (such as an NTP timeline fixer, a beacon detector, a process tree hunt, a link deobfuscator, a prompt injection demo for AI assistants, a CVSS calculator, a context-based prioritizer, a Cyber Kill Chain mapper, a Diamond Model pivot, an evidence hashing demo and an MTTD/MTTR calculator), 24 simulations, 427 spaced-repetition flashcards, 298 quiz questions, and a timed practice exam (85 questions in 165 minutes, or a 43-question half exam) weighted by domain and scored against the 750 passing score. It uses the same level-up system as the other guides, with analyst ranks from SOC Trainee to CySA+ Master and 67 badges. Progress is kept separately from the other guides.

The page is built from `cysaplus/src/` in the same way as the other guides. After editing, run:

```
python3 cysaplus/build.py
```

## Disclaimer

These guides are independent study aids. They are not affiliated with or endorsed by CompTIA, Microsoft or Cisco. CompTIA, A+, Network+, Security+ and CySA+ are trademarks of CompTIA, Inc. Microsoft, Azure and AZ-900 are trademarks of the Microsoft group of companies. Cisco, Cisco IOS and CCNA are trademarks of Cisco Systems, Inc.
