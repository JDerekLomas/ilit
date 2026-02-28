# I-LIT: Design Vision, Purpose, and Pedagogy

This document explains *why* I-LIT exists, *who* it serves, and *how* each feature connects to reading science. Read this before building anything — the UI decisions only make sense when you understand the instructional design behind them.

---

## What This Is

I-LIT (Interactive Literacy Intervention Technology) is a digital reading intervention for adolescent struggling readers. The original was developed by Savvas Learning Company (formerly Pearson) with a team of leading literacy researchers. Our replica recreates the student-facing digital experience as a modern web app.

**The core promise:** Students reading significantly below grade level use I-LIT daily as part of a structured classroom intervention. The program adapts to each student's reading level and ramps text complexity over the school year, with continuous formative assessment baked into the reading experience itself.

**What we are NOT building:** The teacher-facing dashboard, the adaptive leveling engine, or the classroom instructional components (Read Aloud Think Aloud, Classroom Conversation). Our build is the student-facing digital tool — the part students interact with during "Time to Read" and "Work Time" segments of the workshop model.

---

## Who It Serves

**Primary users:** Grades 4-8 students reading significantly below grade level. This includes:

- Students with reading difficulties (decoding, fluency, comprehension)
- English Language Learners at varying proficiency levels
- Students in RTI/MTSS Tier 2 (supplemental) or Tier 3 (intensive) intervention

**Context of use:** A reading intervention classroom, typically 45 minutes daily. Students use the app on tablets (iPad landscape is the primary form factor). The teacher circulates, conferences with individual students, and leads whole-group instruction at specific points.

**Key user characteristics:**
- Many have negative associations with reading and school
- Need high-interest content to build motivation
- Need scaffolding that doesn't feel patronizing (age-appropriate topics at lower reading levels)
- Need immediate feedback, not delayed grading
- Large touch targets — fine motor precision varies

---

## The Workshop Model

I-LIT is designed around a daily 45-minute workshop structure based on the Gradual Release of Responsibility (Pearson & Gallagher, 1983): "I do it" -> "We do it" -> "You do it together" -> "You do it alone."

| Segment | Duration | What happens | Digital features used |
|---------|----------|-------------|---------------------|
| **Time to Read** | ~10 min | Independent reading from the digital library. Student self-selects books at their level. | Library, eBook Reader |
| **Vocabulary** | ~5 min | Teacher-led word study. Pre-teaches words from the day's anchor text. | Word Bank (notebook), Vocabulary popup |
| **Read Aloud, Think Aloud** | ~10 min | Teacher reads grade-level anchor text aloud, modeling comprehension strategies (predicting, questioning, clarifying, summarizing). | Not digital — teacher-led |
| **Classroom Conversation** | ~5 min | Structured student discussion about the anchor text. | Not digital — teacher-led |
| **Whole Group / Work Time** | ~10 min | Explicit skills instruction, then students differentiate into IR passages, study plans, or journal writing. Teacher conferences individually. | Interactive Reader, Assignments, Notebook |
| **Wrap-Up** | ~5 min | Closure, sharing, homework. | Not digital — teacher-led |

**Why this sequence matters:** The teacher models first (Read Aloud), then the class practices together (Conversation), then students work independently (Work Time). Vocabulary is front-loaded so students encounter familiar words during reading. Independent reading bookends the lesson to build volume and choice.

**What our build covers:** Time to Read (Library + Reader) and Work Time (Interactive Reader + Assignments + Notebook). The teacher-led segments happen in the physical classroom.

---

## The Adaptive Lexile System

I-LIT uses 9 reading level bands spanning approximately 100L to 1400L. This is the engine that makes it an *intervention* rather than just a reading app.

### How placement works

1. Students take the GRADE diagnostic (Group Reading Assessment and Diagnostic Evaluation) at the beginning of year.
2. GRADE score maps to one of 9 level bands.
3. Each band has its own set of Interactive Reader passages calibrated to that complexity range.
4. Within each band, texts stair-step in complexity over the school year — ending approximately two grade levels higher than the start.

### How levels adjust

- Every 1-2 weeks, checkpoint scores and summary writing performance are evaluated.
- Students who demonstrate mastery move up; students struggling stay or move down.
- This isn't a one-time placement — it's continuous adaptive adjustment.
- The Library's "My Level" filter also tracks the current Lexile level, ensuring independent reading choices match ability.

### Our implementation

We don't have the adaptive engine. Our passages are static at fixed Lexile levels (500, 600, 700 for our three current passages). The level bands and adjustment logic would require server-side infrastructure. But the UI should still surface the student's Lexile level and show progress over time via localStorage.

---

## How Each Feature Connects to Pedagogy

### Interactive Reader (IR)

**What it is:** Nonfiction passages presented slide-by-slide with embedded comprehension checkpoints.

**Pedagogical purpose:** This is the core formative assessment engine. It implements *retrieval practice* — testing during reading improves retention more than reading alone. The interleaving of reading and checkpoints forces active processing rather than passive consumption.

**Why checkpoints are inline, not at the end:** Research shows that distributed assessment during reading produces better comprehension outcomes than end-of-text quizzes. Students can't "read" passively and then fail a quiz — they must demonstrate understanding *as they go*.

**Why two attempts with decreasing points (2.0 / 1.5 / 0):** The two-attempt model gives students a chance to self-correct. The scoring differential rewards getting it right the first time while still giving partial credit for learning from the feedback. This is gentler than all-or-nothing grading, which is important for students who already have negative associations with assessment.

**Why the summary slide:** Summary writing is the strongest single measure of reading comprehension. It requires the student to synthesize the entire passage, select key ideas, and express them in their own words. The automated feedback loop (write → get feedback → revise) teaches the process of revision, not just the product.

**Reading skills assessed:**
- Make Inferences — reading between the lines
- Author's Purpose — why the text was written
- Cause and Effect — understanding relationships
- Main Idea — distinguishing important from unimportant
- Text Evidence — supporting claims with specific text

These are the comprehension skills that struggling readers most need explicit instruction on. Each checkpoint labels its skill ("Make Inferences") so the student learns the *names* of reading strategies, building metacognitive awareness.

### Digital Library

**What it is:** 3,000+ leveled fiction and nonfiction eBooks (27 in our build) with a 3D carousel browser, reader with annotations, and progress tracking.

**Pedagogical purpose:** This serves the "Time to Read" segment. Reading volume is the single strongest predictor of reading growth. Kelly Gallagher's research on "readicide" (schools killing the love of reading) identifies student choice as critical — students who choose their own books read more.

**Why the carousel (not a list):** The 3D carousel is engaging and visual. Struggling readers often can't evaluate books from titles alone — they need to see covers. The carousel makes browsing feel like browsing a physical shelf, not scrolling a database.

**Why "My Level" filtering:** Left to their own devices, struggling readers often pick books that are too easy (comfortable but no growth) or too hard (frustrating and abandoned). Level-appropriate filtering guides choice without removing it.

**Why word-level interaction (TextHelp):** Every word in the reader is individually tappable. Tapping shows pronunciation, definition, and translation. This scaffolds comprehension for students encountering unfamiliar vocabulary without breaking the reading flow. For ELLs, the 100+ language translation feature is critical.

**Why track Total Words / Total Pages / Total Books:** Making reading volume visible and quantifiable motivates continued reading. These metrics are the student's reading "stats" — similar to gamification, but tied to genuine accomplishment.

**Why book reviews:** Writing about reading deepens comprehension (writing-to-learn). Peer reviews create a social reading community and authentic audience. When students know classmates will read their review, it adds purpose. Peer recommendations also drive further reading.

### Notebook

**What it is:** A skeuomorphic spiral-bound notebook with five sections: Journal, Word Bank, Class Notes, My Work, Resources.

**Pedagogical purpose:** The notebook is about *ownership*. Struggling readers often feel school happens *to* them. The fingerprint-locked personal notebook says: this space is yours.

**Why the skeuomorphic design:** The ruled lines, spiral binding, and paper texture are deliberate. They create a metaphor for a physical notebook — something familiar and personal. The fingerprint scanner is both fun and signals privacy ("only you can open this").

**Why Journal:** Low-stakes personal writing builds writing fluency without the pressure of formal assessment. Date-stamped entries create a visible record of growth over time.

**Why Word Bank:** Students learn vocabulary best when they have ownership over which words they collect. The Word Bank is self-curated — students add words they encounter during reading, not a teacher-assigned list. This is active vocabulary learning.

**Why Class Notes:** Teacher-pushed notes and graphic organizers (Venn diagrams, timelines, cause-effect charts) provide scaffolding for organizing thinking. These are tools for structured comprehension, not just note-taking.

**Why My Work:** A portfolio view of completed assignments with scores. Students can see their own progress. The "View Feedback" buttons make assessment transparent rather than mysterious.

### Assignments

**What it is:** A structured assignment system with categories: Interactive Reading, Study Plan, Vocabulary/Word Study, iPractice, Writing, Monitor Progress, Information.

**Pedagogical purpose:** This is the practice engine. The category structure maps to different aspects of reading development:

| Category | What it develops |
|----------|-----------------|
| Interactive Reading | Comprehension strategies (inference, main idea, cause-effect) |
| Study Plan | Pre/practice/post-test cycles for targeted skill gaps |
| Vocabulary, Word Study | Word knowledge, morphological awareness (prefixes, suffixes, roots) |
| iPractice | Grammar, spelling, fluency — daily skill building |
| Writing | Extended writing (essays, paragraphs) |
| Monitor Progress | Benchmark assessments + reading checks for growth measurement |

**Why the red/green badge system:** Simple, clear visual accountability. Red = work to do. Green = done. No ambiguity. Students with executive function challenges (common in struggling readers) need this clarity.

### Connect

**What it is:** A simple communication channel with a comments feed and star reward system.

**Pedagogical purpose:** The teacher-student relationship is one of the strongest predictors of intervention success, especially for struggling readers who often have negative school associations.

**Why it's so simple (just comments + stars):** This isn't trying to be Slack or Google Classroom. It's a direct, personal line between one teacher and one student. The simplicity is the point — it's approachable.

**Why stars:** A token economy / gamification element. Extrinsic motivation research shows it can be effective for building initial engagement with adolescents who need quick wins. The large star graphic is deliberately prominent and celebratory.

---

## Design Philosophy

### Skeuomorphic where the original is skeuomorphic

The notebook has spiral binding and ruled lines (real PNG textures, not CSS). The book reader has a wooden frame. The library has a 3D carousel. These aren't decorative choices — they create *metaphorical* understanding. A notebook that looks like a notebook communicates "write in me" without explanation.

### Dark UI for immersive reading

The library, reader, and dashboard use dark backgrounds. This reduces visual distraction during reading and creates an immersive, almost theatrical environment. The white text panels "pop" against dark backgrounds, focusing attention on the content.

### Vibrant gradients for navigation

The dashboard backgrounds use pink-to-teal constellation patterns (bg3.jpg). These are visually exciting and signal "you are in the hub" vs. "you are reading." The contrast between the colorful dashboard and the focused reading environments is intentional.

### Large touch targets

This is a tablet-first app for kids. Buttons are big. Tap areas are generous. The bottom nav icons are sized for thumbs, not mouse cursors.

### Immediate feedback, always

Every interaction gets an immediate response. Correct highlights show "YOU GOT IT!" instantly. Wrong answers get corrective feedback within 2-3 seconds. The summary slide has a "Get Feedback" button, not a "submit and wait for your teacher" workflow. This immediacy is critical for engagement and for the formative assessment cycle.

### Content is age-appropriate, not level-appropriate

The *topics* in Interactive Reader passages are chosen for adolescent interest: bomb-sniffing dogs, the science of hearing damage, hidden advertising in media. These are topics a middle schooler would find genuinely interesting. The *reading level* is calibrated to the student's ability, but the subject matter never talks down to them. This is a core principle of intervention design — you can scaffold reading difficulty without infantilizing content.

---

## Theoretical Foundations

The program draws on these research-validated frameworks:

### Gradual Release of Responsibility (Pearson & Gallagher, 1983)
The workshop model's structure: teacher models → class practices together → students work independently. Every I-LIT lesson follows this arc.

### Science of Reading / Five Pillars (National Reading Panel, 2000)
Phonological awareness, phonics, fluency, vocabulary, and comprehension. I-LIT addresses all five, with adaptive foundational skills for students who need phonics/phonological awareness work.

### SIOP — Sheltered Instruction Observation Protocol (Echevarria, Vogt, Short)
Embedded strategies for making grade-level content accessible to English Language Learners. Translation, visual vocabulary, and structured academic discussion all come from SIOP.

### Culturally and Linguistically Responsive Teaching (Sharroky Hollie)
Validates students' home culture and language while building academic English. Influences content selection and instructional tone.

### Text Complexity Staircase (Elfrieda Hiebert)
The TExT model ensures texts are sequenced with controlled vocabulary ramps. At least 98% of words at each level come from designated vocabulary at that level or lower.

### Readicide Prevention (Kelly Gallagher)
Student choice in reading, high volume of recreational reading, and a 50/50 balance of recreational and academic reading. This drives the large digital library and the "Time to Read" segment.

---

## Program Authors

| Author | Expertise | Contribution to I-LIT |
|--------|-----------|----------------------|
| **Sharon Vaughn, Ph.D.** | Reading intervention, RTI, learning disabilities (UT Austin) | Intervention design, RTI framework, efficacy research |
| **Elfrieda Hiebert, Ph.D.** | Text complexity, vocabulary, fluency (TextProject) | Text sequencing, staircase of complexity, vocabulary control |
| **Jim Cummins, Ph.D.** | Bilingual education, BICS/CALP (University of Toronto) | ELL scaffolding, academic language development |
| **Sharroky Hollie, Ph.D.** | Culturally responsive teaching (CSU Dominguez Hills) | CLR framework, cultural relevance of content |
| **Kelly Gallagher** | Adolescent literacy, readicide (Magnolia High School) | Independent reading design, student choice, library volume |
| **William Brozo, Ph.D.** | Adolescent literacy, boys' engagement (George Mason) | High-interest content selection, masculine reading identity |
| **Roger Bonair-Agard** | Poetry, performance art (Fordham University) | Creative writing, arts integration, authentic literary voice |

---

## RTI/MTSS Placement

- **iLit45** (our model): Tier 2 or Tier 3 intervention. 45 minutes daily, intensive.
- **iLit20**: Tier 2 supplement. 15-20 minutes, 2-5 times weekly.
- **iLitELL**: Tier 2/3 + designated ELD. Can serve as core curriculum for newcomer ELLs.

The built-in assessment system (GRADE diagnostic + continuous progress monitoring) provides the data infrastructure for RTI decision-making: placement, monitoring, and response determination.

---

## Efficacy Evidence

**ESSA rating:** Level 3 — Promising Evidence (based on a 2015 correlational study with control groups).

**GRADE assessment gains (after one year, Grade 7):**
- Total: +11 percentiles
- Vocabulary: +14 percentiles
- Listening Comprehension: +31 percentiles

**The "2 years in 1 year" claim:** This is the marketing framing. It refers to the fact that text complexity within each band increases by approximately two grade levels over the school year. The actual standardized test gains are meaningful (~11 percentiles) but more nuanced than the headline suggests.

**Honest assessment:** The research base is publisher-funded and holds the third of four ESSA tiers. There's no independent RCT in the What Works Clearinghouse. The program's author team is strong (Sharon Vaughn and Elfrieda Hiebert are top-tier researchers), and the pedagogical design is well-grounded in established reading science. The evidence is promising but not definitive.

---

## What Our Build Preserves vs. What It Doesn't

### We preserve:
- The student-facing digital experience (Library, IR, Notebook, Assignments, Connect, Review)
- The reading checkpoint model (inline formative assessment during reading)
- The two-attempt scoring model (immediate feedback, chance to self-correct)
- The skeuomorphic design language (notebook textures, wooden reader frame, constellation gradients)
- Word-level interaction in the eBook reader (tap any word for help)
- Student agency (book choice, self-curated word bank, personal journal)
- Progress visibility (scores, reading stats, completion badges)

### We don't have:
- Adaptive level adjustment (our passages are at fixed Lexile levels)
- The teacher-led workshop components (Read Aloud, Conversation)
- Automated summary scoring (PKT API)
- Pre-recorded passage audio (we use browser TTS)
- The full 3,000+ book library (we have 27 books)
- Server-side data persistence (we use localStorage)
- Teacher dashboard or classroom management
- LTI integration with school LMS platforms

### Why that's okay for now:
Our build demonstrates the student experience and the interaction model. A student using our app would encounter the same reading-checkpoint-feedback loop, the same library browsing experience, and the same notebook tools. What's missing is the adaptive intelligence and the classroom ecosystem — both of which require server infrastructure and teacher involvement that goes beyond a digital prototype.
