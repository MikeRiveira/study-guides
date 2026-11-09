# Study Guides

Free, interactive study guides that run in any browser. No sign-up, no install.

| Guide | Live site |
|---|---|
| CompTIA A+ (Core 1 220-1201, Core 2 220-1202) | https://mikeriveira.github.io/study-guides/aplus/ |

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

## Disclaimer

These guides are independent study aids. They are not affiliated with or endorsed by CompTIA. CompTIA and A+ are trademarks of CompTIA, Inc.
