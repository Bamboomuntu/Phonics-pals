# Phonic Pals

## Bilingual Language Learning Platform for Uganda's Schools

### Partnership Proposal: Kayuwawa Properties Ltd & Tech Reach Africa

**Version 1.0 — May 2026**
**Prepared by Timothy Okoth-Osillo, Founder, Kayuwawa Properties Ltd**

---

## 1. Executive Summary

Phonic Pals is a bilingual pronunciation game that runs entirely offline on a standard laptop. It addresses two parallel language crises in Uganda: (1) the gap in English pronunciation feedback that holds children back from confidence in speaking, and (2) the absence of verified digital audio datasets for Uganda's 40+ living languages.

The game works in two phases. In the first, a child sees a picture, hears the English word, and repeats it into a microphone. An AI model running locally on the laptop gives instant star-rated feedback on pronunciation accuracy. In the second phase — "Teach the Machine" — the child speaks the equivalent word in their mother tongue (Lusoga, Luganda, etc.). A teacher acting as Cultural Umpire confirms the recording is correct. Every approved recording becomes part of a community-owned audio dataset that can power future speech recognition, text-to-speech, and translation tools for Ugandan languages.

This proposal seeks a seed investment of **UGX 1,200,000–1,500,000** for a single documented pilot deployment at one school in the Tech Reach Africa network, producing the proof-of-concept footage and data needed to secure Phase 2 grants of **USD 50,000–250,000**.

---

## 2. The Problem

### 2.1 The English Pronunciation Gap

Uganda's primary school system teaches English as the medium of instruction from Primary One. However, classes of 80+ students with a single teacher make individual pronunciation feedback impossible. A child can read a word perfectly and still pronounce it unintelligibly — and never know.

This gap compounds across years. By the time students reach job interviews, university presentations, or professional environments, the confidence to speak fluently is often the barrier — not the knowledge. The soft skills economy in Kampala, Nairobi, and beyond increasingly demands spoken English competence. The current system does not deliver it.

**Key statistics:**
- Teacher-to-student ratio in Ugandan primary schools: 1:54 (national average), often 1:80+ in rural areas
- Class time available for individual oral feedback per child per week: effectively zero
- Children entering Primary 1 with strong mother tongue fluency and minimal English exposure: majority in rural Uganda

### 2.2 The Language Data Gap

Uganda is home to over 40 living languages. These include Lusoga (~3 million speakers), Luganda (~7 million), Runyankore (~3.5 million), Acholi (~1.5 million), and dozens more. None of these languages has:

- Commercial-grade speech recognition
- Natural text-to-speech voices
- Verified audio datasets for AI training
- Meaningful representation in the voice assistant economy

Without community-owned, ethically sourced audio data, these languages risk being locked out of the technological future. If a Siri, Alexa, or ChatGPT for local languages is coming, it will only work if the training data exists. Currently, it does not.

### 2.3 The Opportunity

These two problems have the same solution: a laptop with a microphone, a child who speaks both languages, and a game that makes the recording process feel like play. Phonic Pals is that solution.

---

## 3. The Solution: Phonic Pals

### 3.1 How It Works

**Phase 1: Hear & Repeat** (English pronunciation)
1. A picture appears on screen — a cow, a tree, a bunch of matooke
2. The app speaks the English word aloud using AI-generated voice
3. The child hits the big buzzer button and repeats the word
4. An AI model on the laptop analyses the recording and gives instant star-rated feedback (1–3 stars)
5. If the word is difficult, it goes into a Review Deck for practice

**Phase 2: Teach the Machine** (Local language recording)
1. The same picture appears again
2. The app asks: "Now teach me your word"
3. The child says the Lusoga (or Luganda, Runyankore, etc.) equivalent into the microphone
4. The teacher, using a simple phone-based Umpire interface, listens and approves or rejects the recording
5. Approved recordings are saved locally with metadata (word, language, speaker age, school, date, gender)

**Phase 3: Review & Dashboard** (Learning reinforcement + data pipeline)
1. The child sees their star total, earned badge, and tricky words for review
2. A dashboard shows words mastered, session duration, and pronunciation improvement

### 3.2 Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Phonic Pals PWA                          │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ App Shell    │  │ Game Engine  │  │ Data Pipeline  │  │
│  │ (Landing,    │  │ (Flashcard,  │  │ (IndexedDB,    │  │
│  │  Dashboard,  │  │  Buzzer,     │  │  Corpus Export,│  │
│  │  Umpire)     │  │  Stars)      │  │  Audio Store)  │  │
│  └─────────────┘  └──────────────┘  └────────────────┘  │
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ Gemini TTS  │  │ Gemini Audio │  │ Gemini Image   │  │
│  │ (word pron) │  │ Assessment   │  │ Generation     │  │
│  └─────────────┘  └──────────────┘  └────────────────┘  │
│                                                          │
│  ┌─────────────┐  ┌─────────────────────────────────┐   │
│  │ PWA Offline │  │ Service Worker + Cache Storage  │   │
│  │ Support     │  │ (no internet required to play)  │   │
│  └─────────────┘  └─────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Keyboard Controls (Space=Record, Y/N=Umpire)     │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Key technical decisions:**
- **Progressive Web App (PWA):** No install required. Opens from browser icon. Works offline.
- **Service Worker:** Caches all assets (word packs, images) on first load. Game runs without internet.
- **IndexedDB:** Stores all approved local-language recordings as base64 audio with full metadata.
- **No cloud dependency during play:** AI pronunciation assessment happens locally via Gemini API (Gemini does require API call, but word packs and images are cached). *Future: local Whisper-based assessment for full offline independence.*
- **Keyboard-first design:** Space bar = record, Y/N = umpire approve/reject, Enter = next word. Works on scrap hardware with no touchscreen.

### 3.3 Word Packs

| Pack | English Words | Lusoga Translations | Source |
|------|--------------|--------------------|--------|
| Animals | cow, goat, chicken, lion, elephant, monkey, fish, bird, snake, frog | ente, embuzi, nkoko, empologoma, enjovu, enkima, ebyenyanja, akanyonyi, ensota, ekikere | Community elder + translator |
| Home | house, door, table, chair, bed, window, cup, plate, knife, spoon | enju, olugi, emmeeza, entebe, ekitanda, eddirisa, ekikopo, essowaani, ekiso, eyiiko | Community elder + translator |
| School | book, pen, desk, teacher, chalk, bag, ruler, board, pencil, paper | ekitabo, ekiwandiiko, eddwaliro, omusomesa, kaawo, ensavo, olutindo, bboodi, ekalaamu, eppapula | Community elder + translator |
| Food & Nature | water, matooke, rice, beans, sweet potato, mango, tree, sun, rain, soil | amazzi, matooke, omuceere, ebijanjaalo, lumonde, muyembe, omuti, enjuba, enfuba, ettaka | Community elder + translator |
| Body & Family | head, eye, mouth, hand, leg, mother, father, baby, brother, sister | mutwe, liiso, kamwa, mukono, kugulu, maama, taata, omwana, muganda, mwanyina | Community elder + translator |

> **Note:** Above Lusoga translations are indicative and must be verified by community elders during word pack development. Each pack requires a half-day session with 2–3 Lusoga speakers.

---

## 4. Pilot Deployment Plan

### 4.1 The Phonic Unit

Each Phonic Unit is a self-contained deployment package:

| Component | Source | Estimated Cost (UGX) |
|-----------|--------|---------------------|
| Laptop (refurbished, 4GB RAM, SSD) | Tech Reach Africa existing stock or purchase | 400,000–500,000 |
| USB microphone (basic, durable) | Local electronics shop | 50,000–80,000 |
| Buzzer button (arcade-style big red button) | Salvaged or ordered (AliExpress or local) | 30,000–50,000 |
| USB hub (for mic + buzzer) | Local electronics | 20,000–30,000 |
| Solar panel (100W, portable) | Local solar vendor (e.g., Lubaga) | 200,000–300,000 |
| Battery bank (deep cycle, 12V/20Ah) | Solar accessory | 150,000–200,000 |
| Carrying case (plastic toolbox) | Hardware shop | 30,000–50,000 |
| Speaker (USB-powered) | Computer accessories shop | 40,000–60,000 |
| **Total per unit** | | **920,000–1,270,000** |

> Note: If Tech Reach Africa already has laptops in stock, the incremental cost per unit drops to **~520,000–770,000** (solar + mic + buzzer + accessories).

### 4.2 Pilot Session Structure

| Time | Activity | Who |
|------|----------|-----|
| 08:00–08:30 | Phonic Unit setup, projector/speaker test | Field officer |
| 08:30–08:45 | Welcome, child briefing, demo game | Teacher champion |
| 08:45–09:30 | Group 1: 10 children, 3 min each | Children rotate |
| 09:30–10:15 | Group 2: 10 children | Children rotate |
| 10:15–10:30 | Break | All |
| 10:30–11:15 | Group 3: 10 children | Children rotate |
| 11:15–12:00 | Group 4: 10 children + wrap-up | Children + teacher |
| 12:00–12:30 | Teacher debrief, data export, pack-down | Field officer |

**Outputs from one pilot session:**
- 40 children play the game (each completes 5–10 words)
- ~200–400 English pronunciation assessments
- ~200–400 verified local-language recordings
- 2–3 minutes of edited video footage
- 15–20 high-quality photographs
- Teacher + student feedback forms
- Hardware reliability report

### 4.3 Word Pack Development

| Step | Duration | Cost (UGX) | Responsibility |
|------|----------|-----------|----------------|
| Recruit 2–3 Lusoga elders/teachers | 1 week | 100,000 (stipends) | Kayuwawa/TRA |
| Word list review and translation session | Half-day | 50,000 (transport + refreshment) | Elders + Kayuwawa |
| Recording of reference pronunciation | 2 hours | 50,000 | Teacher champion |
| Digital pack construction (audio pairing, JSON) | 1 day | — | Kayuwawa (tech team) |
| Quality check with a test child session | Half-day | 30,000 | TRA field officer |
| **Total word pack development** | | **230,000** | |

---

## 5. Budget

### 5.1 Seed Investment (Phase 1 Pilot)

| Item | Cost (UGX) | Notes |
|------|-----------|-------|
| Phonic Unit build (laptop + mic + buzzer + solar + case + speaker) | 1,000,000 | One complete unit |
| Lusoga word pack development (3 elders, 1 day) | 150,000 | Stipends, transport, refreshment |
| Teacher briefing session (half-day) | 50,000 | Transport, lunch for 1 teacher champion |
| Videographer + photographer (1 school day) | 200,000 | Kampala/Jinja rates |
| Transport (Jinja ↔ pilot school, round trip) | 100,000 | Fuel + driver |
| Contingency | 75,000 | 10% buffer |
| **Total** | **1,575,000** | Can reduce to 1,200,000 by using existing TRA laptop |

### 5.2 Phase 2 Scale-Up (Next 12 Months)

| Item | Cost (USD) | Notes |
|------|-----------|-------|
| 10 Phonic Units (complete, solar-equipped) | 12,000 | 1,200/unit |
| 5 language word packs (Lusoga, Luganda, Runyankore, Acholi, Ateso) | 2,500 | 500/pack |
| 100 school deployments (25 per unit, 4 units rotating) | 8,000 | Field officer costs |
| Data pipeline & cloud sync infrastructure | 5,000 | Simple Firebase/Firestore backend |
| Training materials + teacher guides | 2,000 | Print + digital |
| Monitoring, evaluation, reporting | 3,000 | Impact measurement |
| Project coordination (part-time, 12 months) | 6,000 | Kayuwawa/TRA |
| Videography + documentation for funders | 3,000 | Per quarter |
| **Total Phase 2** | **~41,500** | |
| **Request to funders** | **50,000–70,000** | Buffer + contingencies |

### 5.3 Phase 3 Regional Expansion (Year 2–3)

- Target: 500 schools, 20 languages, 50 Phonic Units
- Budget: USD 200,000–250,000
- Funders: Google.org, Mozilla Foundation, AI4D Africa, UNESCO, Mastercard Foundation, kingdom sponsors

---

## 6. Partnership Structure

### 6.1 Roles & Responsibilities

| Area | Lead | Support |
|------|------|---------|
| Technology concept & software development | Kayuwawa Properties | Gemini API provisioning |
| Hardware design & Phonic Unit specification | Kayuwawa Properties | Local sourcing consultation |
| Legal & IP structuring | Kayuwawa Properties (Okoth-Osillo Advocates) | — |
| Field deployment & school logistics | Tech Reach Africa | Kayuwawa (branding + tech support) |
| Teacher champion liaison | Tech Reach Africa | — |
| Videography, photography, documentation | Shared cost | Professional videographer TBD |
| Funder proposal writing | Kayuwawa Properties (lead) | Tech Reach Africa (review + input) |
| Community & stakeholder relations | Tech Reach Africa | Kayuwawa (strategic introductions) |
| Impact measurement & reporting | Shared | External evaluator if budget permits |

### 6.2 Intellectual Property

All software (Phonic Pals PWA) shall be open-source under a permissive license (MIT or Apache 2.0), ensuring no single party can lock the other out. Word packs and language datasets shall be community-owned under a Creative Commons Attribution-NonCommercial-ShareAlike license. The Phonic Unit design shall be published as open hardware documentation.

This approach ensures:
- Both partners retain equal rights to use, modify, and deploy the software
- Language communities retain ownership of their data
- Funders see a transparent, ethical IP structure
- Other organisations across Africa can replicate the model freely

### 6.3 Legal Vehicle

For Phase 1, a simple Memorandum of Understanding (MOU) between Kayuwawa Properties Ltd and Tech Reach Africa suffices. For Phase 2 and beyond, a joint venture or special-purpose vehicle (SPV) may be appropriate — legal structuring to be handled by Okoth-Osillo Advocates.

---

## 7. Funding Targets

| Funder | Focus | Ask | Timeline |
|--------|-------|-----|----------|
| **Local / Immediate** | | | |
| Kingdom of Busoga (Obwa Kyabazinga bwa Busoga) | Lusoga language preservation | UGX 2,000,000–5,000,000 | Before pilot |
| Local family foundation / individual donor | Seed pilot | UGX 1,200,000–1,500,000 | Immediately |
| Buganda Kingdom | Luganda preservation interest | Watch — Phase 2 | |
| **International / Medium-Term** | | | |
| Mozilla Foundation (Responsible AI / Data Futures) | Community-owned data, African language inclusion | USD 50,000–100,000 | Q3 2026 |
| AI4D Africa / IDRC | AI for development, language technology | USD 50,000–150,000 | Q3–Q4 2026 |
| Google.org (AI for the Global Goals) | AI-powered education, language preservation | USD 100,000–250,000 | Q4 2026 |
| UNESCO (ICT in Education) | Multilingual education, digital inclusion | USD 50,000–100,000 | Q4 2026 |
| Mastercard Foundation | Youth skills, education technology | USD 100,000–250,000 | 2027 |

---

## 8. Impact Metrics & Success Criteria

### 8.1 Pilot Phase (1 School, 1 Day)

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Children who play a full session | 40 | Game log |
| English words assessed | 200–400 | Game log |
| Local-language recordings collected (approved) | 150–300 | IndexedDB export |
| Average pronunciation star rating (1st attempt) | 1.5–2.5 stars | Game log |
| Children who report enjoyment ("fun" or better) | 80%+ | Post-session sticker survey |
| Teachers who say they would use it again | 90%+ | Brief oral feedback |

### 8.2 Phase 2 (100 Schools, 12 Months)

| Metric | Target |
|--------|--------|
| Schools reached | 100 |
| Children served | 4,000+ |
| English pronunciation assessments | 40,000+ |
| Verified local-language recordings | 20,000+ |
| Languages covered | 5 |
| Languages with sufficient data for basic TTS prototype | 2 |
| Funding raised for Phase 3 | USD 200,000+ |

### 8.3 Long-Term (3 Years)

- All 40+ Ugandan languages with at minimum 1,000 verified recordings each
- Working speech-to-text prototype for at least 5 languages
- Text-to-speech voices for at least 3 languages
- Model replicable by organisations in Kenya, Tanzania, Nigeria, Ghana
- Open-source codebase used by at least 5 other African language preservation projects

---

## 9. Timeline

| Phase | Period | Key Activities | Cost |
|-------|--------|---------------|------|
| **Phase 0: Preparation** | May–June 2026 | Word pack development, Phonic Unit build, teacher briefing | UGX 1.2–1.5M |
| **Phase 1: Pilot** | June 2026 | Single school deployment, videography, data export | Included above |
| **Phase 1.5: Proposal** | July 2026 | Edit pilot footage, write funder proposals | Minimal (editing time) |
| **Phase 2: Scale** | Aug 2026–Aug 2027 | 10 units, 5 languages, 100 schools | USD 50,000–70,000 |
| **Phase 3: Regional** | 2027–2028 | 50 units, 20 languages, 500 schools, regional expansion | USD 200,000–250,000 |

---

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Laptop failure / hardware breakage | Low | Medium | Phonic Unit design uses standard parts, easily replaceable. Backup laptop on standby for pilot. |
| Child mic shyness / refusal to speak | Medium | Low | Demo session, fun buzzer button, pair children. Design is game, not test. |
| Teacher resistance | Low | Medium | Teacher champion model. Briefing includes minimal extra work. Umpire interface is phone-based. |
| Data quality (Lusoga recordings wrong) | Medium | Medium | Teacher Cultural Umpire + independent elder review of 10% sample. Bad recordings rejected before storage. |
| Poor video footage | Medium | High | Professional videographer hired for pilot day. Multiple cameras. Second shooter for photos. |
| Gemini API key expiry or cost | Low | Medium | API key provisioned for full pilot day. Offline word packs mean only API cost is pronunciation assessment and TTS — ~500 calls for a 40-child session. |
| Unable to secure Phase 2 funding | Medium | High | Target multiple funders simultaneously. Kingdom sponsorship as backup path. Pilot footage makes case dramatically stronger. |

---

## 11. Why Tech Reach Africa

Tech Reach Africa is the right partner for this work because:

1. **Trusted access.** 21 schools, 350 teacher champions. The infrastructure to deploy exists and works.
2. **Field-proven model.** Mobile computer labs that work without electricity or internet. The Phonic Unit is a natural extension.
3. **Community credibility.** Both schools and funders trust TRA. A joint proposal carries weight neither organisation has alone.
4. **Understanding of implementation.** TRA knows the gap between a great concept and what actually works in a rural classroom. Phonic Pals has been designed with that gap in mind.
5. **Scalability potential.** If this works in one TRA school, it works in 21. Then it works in 100.

---

## 12. Call to Action

We are seeking:

1. **Partnership agreement** — Kayuwawa Properties + Tech Reach Africa, formal MOU
2. **Seed funding** — UGX 1,200,000–1,500,000 (joint or donor-sourced)
3. **Pilot school selection** — one school in TRA network, June 2026
4. **Teacher champion identification** — one motivated teacher for briefing + session

**With this seed, we deliver:**
- One working Phonic Unit
- One verified Lusoga word pack
- 2–3 minutes of powerful outreach footage
- A photo essay
- A joint funder proposal ready for submission

**Without this seed, nothing changes.** Another academic paper will be written about African language data gaps. Another UNESCO report will recommend something. And a child in rural Busoga who could teach a machine to speak Lusoga will simply not have the chance.

The window for being first is open.

---

**Contact:**
Timothy Okoth-Osillo
Founder, Kayuwawa Properties Ltd
Lead Counsel, Okoth-Osillo Advocates
Plot No. 7 Iganga Road, Jinja, Uganda

**In partnership with:**
Ntende Beka Isabirye
Founder and Team Leader
Tech Reach Africa
Kampala / East & Central Uganda Operations
