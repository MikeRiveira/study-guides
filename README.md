# Study Guides

Free, interactive study guides that run in any browser. No sign-up, no install.

| Guide | Live site |
|---|---|
| CompTIA A+ (Core 1 220-1201, Core 2 220-1202) | https://mikeriveira.github.io/study-guides/aplus/ |
| CompTIA Network+ (N10-009) | https://mikeriveira.github.io/study-guides/netplus/ |
| CompTIA Security+ (SY0-701) | https://mikeriveira.github.io/study-guides/securityplus/ |

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

## Disclaimer

These guides are independent study aids. They are not affiliated with or endorsed by CompTIA. CompTIA, A+, Network+ and Security+ are trademarks of CompTIA, Inc.
