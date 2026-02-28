# I-LIT CMS Data Architecture

Complete documentation of the Django CMS that powers the Savvas I-LIT reading intervention platform. Based on source code analysis of the production CMS at `docs/classview/CMS/`.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Database Architecture](#database-architecture)
3. [Content Hierarchy](#content-hierarchy)
4. [Model Reference](#model-reference)
   - [Curriculum Models](#curriculum-models)
   - [Library Models](#library-models)
   - [Activity Models](#activity-models)
   - [Slide Type Models](#slide-type-models)
   - [Interactive Word Text (IWT)](#interactive-word-text-iwt)
   - [Sort Models](#sort-models)
   - [Essay & Writing Models](#essay--writing-models)
   - [Classroom & User Models](#classroom--user-models)
   - [Customer Organization Models](#customer-organization-models)
   - [Reporting & Progress Models](#reporting--progress-models)
   - [Assessment Models](#assessment-models)
   - [Configuration Models](#configuration-models)
   - [Support Models](#support-models)
5. [Content Pipeline](#content-pipeline)
6. [API Endpoints](#api-endpoints)
7. [Key Questions Answered](#key-questions-answered)

---

## System Overview

The CMS is a Django 1.x application with 29 installed apps. It serves as the authoring and management backend for the I-LIT iPad reading intervention app. Content is authored in a Django admin interface, stored in PostgreSQL, automatically synced to CouchDB document databases, and then replicated to classroom servers for offline iPad use.

### Installed Apps (from settings.py)

```
core, customers, classroom, library, curriculum, activities, slide_types,
iwt, sort, rubric, phonics, student_resources, scaffolded_tips, study_plan,
unit_benchmark, configuration, reporting, eclipse (main), data_migration_utility
```

Plus third-party: `tastypie`, `watson` (search), `south` (migrations), `celery` (async tasks), `tinymce` (rich text editing).

### Products

Four product variants ship from the same CMS:

| pk | product_code | name            |
|----|-------------|-----------------|
| 1  | `ilit`      | National 90     |
| 2  | `ca45`      | CA Intervention |
| 3  | `caell`     | CA ELL          |
| 4  | `capre`     | CA Premium      |

---

## Database Architecture

### Dual Database System

**PostgreSQL** (`eclipse_production`) -- Relational data, the authoritative store for all models.

**CouchDB** -- Document store for content delivery. Models inheriting from `SerializingCouchModel` automatically serialize to CouchDB documents when saved in Django.

### CouchDB Database Naming

| Database Pattern | Content |
|-----------------|---------|
| `library_meta` | Book metadata (covers, blurbs, lexile levels) |
| `library_epub` | EPUB files for eBook reader |
| `curriculum` | Curriculum structure (units, weeks, days, slides, activities) |
| `{student_id}_{classroom_id}` | Per-student databases (progress, work) |
| `server-{mac_address}` | Per-classroom-server databases |

### Key Base Classes

**`SerializingCouchModel`** (from `mm.django.models.couch`): Core mixin that syncs Django model instances to CouchDB. Key attributes:
- `COUCHDB_DATABASE_NAME` -- Target CouchDB database
- `COUCHDB_TYPE` -- Document type string written to CouchDB
- `EXTRA_DICT_FIELDS` -- Computed properties to include in CouchDB document
- `EXCLUDE_DICT_FIELDS` -- Fields to omit from CouchDB document
- `_id` -- CouchDB document ID (UUID)
- `_rev` -- CouchDB revision string (for conflict detection)

**`SerializingModel`** (from `mm.django.models`): Serializes to dict but does NOT sync to CouchDB. Used for child objects that are embedded in their parent's CouchDB document.

**`BaseSlide`** (abstract, from `curriculum.models`): Common fields for all slide types:
- `subskill` -- FK to SubSkill (for skill tracking)
- `page_title`, `slide_title` -- Display titles
- `forty_five_note`, `ell_note`, `pd_note` -- Instructor notes
- `pd_video` -- FK to Video
- `app_tip` -- Text tip for iPad app

---

## Content Hierarchy

```
Product (e.g., "National 90")
  └── UnitSet (container, e.g., "iLit 2.0 National 90 Curriculum")
        └── Unit (1-10, e.g., "Unit 1: Adventures in Reading")
              └── Week (1-50 per unit)
                    ├── Day 1-5 (each day has 8 activity slots)
                    │     ├── Vocab (vocabulary instruction)
                    │     ├── TimeToRead (independent reading)
                    │     ├── RATA (Read Aloud Think Aloud -- teacher-led)
                    │     ├── ClassroomConversations
                    │     ├── WholeGroup (whole group instruction)
                    │     ├── WorkTime (independent/guided work)
                    │     ├── WrapUp (lesson closure)
                    │     └── DailyAssignment (fillable worksheets)
                    │
                    ├── IWT (Interactive Word Text -- 9 reading levels per week)
                    ├── WordSlam (vocabulary game)
                    ├── Essay (writing assignment)
                    ├── Paragraph (shorter writing)
                    ├── WritingPromptSlide (journal prompts)
                    └── StudyPlan (assessment + practice)
```

### The Day's MODEL_MAP

Each Day object defines exactly which activity types it contains:

```python
MODEL_MAP = {
    'vocab':          ('activities', 'Vocab'),
    'work_time':      ('activities', 'WorkTime'),
    'wrap_up':        ('activities', 'WrapUp'),
    'whole_group':    ('activities', 'WholeGroup'),
    'rata':           ('activities', 'ReadAloudThinkAloud'),
    'time_to_read':   ('activities', 'TimeToRead'),
    'dailyassignment':('activities', 'DailyAssignment'),
    'classroom_conversations': ('activities', 'ClassroomConversations'),
}
```

---

## Model Reference

### Curriculum Models

**Source**: `/docs/classview/CMS/apps/curriculum/models.py` (~1285 lines)

#### Product
```
Fields: name (unique), product_code (unique), state_standard_label, reuse_content (bool),
        sequence_number, source_product (self FK), product_type (iLit20 / non-iLit20)
CouchDB: SerializingCouchModel
```

#### Skill
```
Fields: name (unique), report_type (reading / language / vocabulary / writing)
CouchDB: SerializingCouchModel
```

#### SubSkill
```
Fields: skill (FK to Skill), description
CouchDB: SerializingCouchModel
Note: Used everywhere to tag slides for skill-level progress tracking
```

#### UnitSet
```
Fields: title, product (FK), word_count_goal, units (M2M through UnitSetThrough)
CouchDB: database='curriculum'
```

#### Unit
```
Fields: name, theme, number (1-10), supplemental_unit (bool), explanation (HTML),
        objectives (HTML), cc_standards (HTML)
CouchDB: SerializingCouchModel
```

#### Week
```
Fields: unit (FK), number (1-50), supplemental_type
CouchDB: database='curriculum'
Extra dict: days, iwt, paragraph, essay, word_slam, study_plans
```

#### Day
```
Fields: week (FK), number (1-5), title, explanation (HTML), objectives (HTML),
        cc_standards (HTML), sl_grade_assessment (FK to GradeAssessment)
CouchDB: database='curriculum'
Extra dict: All 8 activity types via MODEL_MAP
```

#### BaseSlide (abstract)
```
Fields: subskill (FK), page_title, slide_title, forty_five_note, ell_note,
        pd_note, pd_video (FK to Video), app_tip
CouchDB: database='curriculum'
```

---

### Library Models

**Source**: `/docs/classview/CMS/apps/library/models.py`

#### Book
```
Fields: title, author, vendor, blurb (HTML), fiction (bool),
        cover (ImageField 512x768), epub (FileField), ebook_layout (bool),
        audio (FileField), word_count, page_count,
        ethnicity, gender, level, lexile_level (int),
        book_type: R=RATA trade book, A=Academic, I=Interface anthology,
        categories (M2M), genres (M2M to BookGenre), videos (M2M to Video),
        search_terms, sets (M2M to BookSet), areaofinterests (M2M)
CouchDB: database='library_meta'
```

Example fixture data:
```json
{
  "model": "library.book",
  "fields": {
    "title": "We Beat the Street",
    "author": "DRAPER, SHARON; DAVIS, SAMPSON; JENKINS, GEORGE; HUNT, RAMEC",
    "cover": "books/ba7f766692a84c7d9a40fbb06677958a",
    "epub": "ba7f766692a84c7d9a40fbb06677958a/we_beat_the_street.epub",
    "lexile_level": 9000,
    "fiction": false,
    "_id": "ba7f766692a84c7d9a40fbb06677958a"
  }
}
```

#### Category
```
Fields: name (unique, e.g., "Science fiction")
```

#### BookGenre
```
Fields: name
```

#### AreaOfInterest
```
Fields: name, code
CouchDB: SerializingCouchModel
```

#### BookSet
```
Fields: name (unique), books (M2M to Book)
CouchDB: database='curriculum'
Note: A classroom is assigned a BookSet, which determines available books
```

#### Video
```
Fields: name, video_type (SCV=Student Concept Video / BBV=Book Builder Video / PD=Prof Dev),
        video (FileField), thumbnail (ImageField)
CouchDB: database='curriculum'
```

---

### Activity Models

**Source**: `/docs/classview/CMS/apps/activities/models.py` (~2654 lines)

All activities (except DailyAssignment) follow the **BaseActivity** pattern:
- One-to-one with a Day (unique FK)
- M2M relationships to 4 slide types: PollSlide, TextSlide, ProjectorSlide, ImageSlide
- Each M2M goes through a bridge table with `sequence_number` for ordering
- `_get_slides` property aggregates all slides into ordered list
- `_get_day` property returns the parent day's CouchDB ID
- Copy-to-day functionality for reusing content across days

#### TimeToRead
```
CouchDB type: 'time_to_read'
Fields: day (FK, unique)
Slides: M2M to PollSlide, TextSlide, ProjectorSlide, ImageSlide
```

#### ReadAloudThinkAloud (RATA)
```
CouchDB type: 'rata'
Fields: day (FK, unique), book (FK to library.Book), passage_set (FK to RATAPassageSet)
Slides: M2M to TextSlide (as book_slides AND text_slides), PollSlide, ProjectorSlide, ImageSlide
Extra: passage stop point calculations, passage_slide FK on through models
Note: The most complex activity -- combines trade book reading with teacher think-alouds
```

#### RATAPassageSet
```
Fields: title
Note: Groups RATAPassageSlides into sets
```

#### RATAPassageSlide
```
CouchDB: database='curriculum'
Fields: passage_set (FK), sequence_number,
        before_stop_point_text (HTML), after_stop_point_text (HTML),
        stop_point (int), audio_file, sync_file
Note: Each slide is a section of text with a stop point where teacher pauses to think aloud
```

#### Vocab
```
CouchDB type: 'vocab'
Fields: day (FK, unique)
Slides: M2M to PollSlide (with extra vocab_word field), TextSlide, ProjectorSlide, ImageSlide
```

#### ClassroomConversations
```
CouchDB type: 'classroom_conversations'
Fields: day (FK, unique)
Slides: M2M to PollSlide, TextSlide, ProjectorSlide, ImageSlide
```

#### WholeGroup
```
CouchDB type: 'whole_group'
Fields: day (FK, unique)
Slides: M2M to PollSlide, TextSlide, ProjectorSlide, ImageSlide
```

#### WorkTime
```
CouchDB type: 'work_time'
Fields: day (FK, unique)
Slides: M2M to PollSlide, TextSlide, ProjectorSlide, ImageSlide
Extra: WorkTimeTextActivity through model has conference_type and is_conference fields
```

#### WrapUp
```
CouchDB type: 'wrap_up'
Fields: day (FK, unique)
Slides: M2M to PollSlide, TextSlide, ProjectorSlide, ImageSlide
```

#### DailyAssignment
```
CouchDB type: 'dailyassignment'
Fields: day (FK), title
Slides: M2M to FillableWorksheet through DailyAssignmentFillableWorksheetActivity
Note: Does NOT use BaseActivity -- uses FillableWorksheet instead of slide types
```

#### WordSlam
```
CouchDB type: 'word_slam', database='curriculum'
Fields: week (FK, unique), title, instructions (HTML),
        tiles (CommaDelimitedSyllableField)
Constraints: MAX_NUMBER_OF_QUESTIONS=12, MAX_NUMBER_OF_SYLLABLES=5, MAX_SYLLABLE_TILES=60
Children: WordSlamQuestion (question_text HTML, question_answer as comma-delimited syllables)
```

#### Association Models
```
AssociateRATABook, AssociateDailyAssignment, AssociateWordSlam
-- Allow content to be shared across multiple products
-- Fields: activity FK, product FK, day FK, level, extra_practice, title
```

---

### Slide Type Models

**Source**: `/docs/classview/CMS/apps/slide_types/models.py` (~2027 lines)

These are the building blocks that activities compose via M2M relationships.

#### PollSlide (BaseSlide)
```
CouchDB type: 'pollslide'
Fields: html (HTML), instruction (HTML), template (choice)
        + 16 button slots (button1_label/text through button16_label/text)
Children: questions (M2M to Question through PollQuestion)
Note: Interactive polls/quizzes presented to students
```

#### TextSlide (BaseSlide)
```
CouchDB type: 'textslide'
Templates: a=centered, b=top, c=conference, d=buttons_above, e=buttons_below,
           f=buttons_middle, g=RATA_book_slide, h=buttons_only
Fields: text_html (HTML), text_below_html (HTML), rubric (FK), si_note, audio
        + 16 button slots
```

#### ProjectorSlide (BaseSlide)
```
CouchDB type: 'projectorslide'
Templates: a through j
Fields: above_text (HTML), below_text (HTML), projected_text (HTML),
        three_col (FK to ThreeCol), venn_diagram (FK to VennDiagram),
        audio, video, image (788x307), projector_image (1024x768)
        + 16 button slots
```

#### ImageSlide (BaseSlide)
```
CouchDB type: 'imageslide'
Fields: image (CouchDBImageField), image_alternative_text
        + 16 button slots
```

#### MultipleChoiceSlide (BaseSlide)
```
Fields: instructional_text, instructional_audio,
        sub_type (sentence_comprehension / passage_comprehension / vocabulary / listening_comprehension),
        skill_sequence
Children: questions (M2M to Question through MultiChoiceQuestion)
        + 16 button slots
```

#### MultiChoicePassageSlide (BaseSlide)
```
Fields: passage (HTML), multi_slide (FK to MultipleChoiceSlide),
        instructional_audio, sub_type
        + 16 button slots
```

#### WritingPromptSlide (BaseSlide)
```
Fields: week (FK), prompt (HTML), prompt_id (for live feedback/scoring)
```

#### FillableWorksheet
```
CouchDB: SerializingCouchModel
Fields: subskill (FK), slide_title, student_text (HTML), teacher_text (HTML), rubric (FK)
Note: Used by DailyAssignment (not BaseSlide-based)
```

#### Question
```
CouchDB: SerializingCouchModel
Fields: question_html (HTML), subskill (FK), instructional_audio,
        image, image_alternative_text
Children: Answer objects
```

#### Answer
```
Fields: is_correct (bool), answer_text_html (HTML), question (FK),
        additional_information_html (HTML)
```

#### ThreeCol (3-column graphic organizer)
```
Fields: column1_header/body, column2_header/body, column3_header/body
```

#### VennDiagram
```
Fields: left_header/body, right_header/body, common_header/body
```

#### GlossaryWord
```
CouchDB: database='curriculum'
Fields: word, animation (CouchDBFileField), photo (CouchDBImageField),
        illustration (CouchDBImageField)
Children: GlossaryDefinition objects
```

#### GlossaryDefinition
```
Fields: word (FK), sequence_num,
        en_definition (HTML), en_definition_audio, en_definition_sync_file,
        es_definition (Spanish HTML), es_definition_audio, es_definition_sync_file
Note: Bilingual English/Spanish definitions with audio + sync files for TTS
```

---

### Interactive Word Text (IWT)

**Source**: `/docs/classview/CMS/apps/iwt/models.py`

The IWT is the **Interactive Reader** -- the core adaptive reading experience. Each week has IWT passages at up to 9 different reading levels.

#### IWT
```
CouchDB: database='curriculum'
Fields: week (FK), level (1-9), title, intro_animation, sample_response
Slides: M2M to IWTDNDSlide, IWTHighlightSlide, IWTTextAnswerSlide, IWTSummarySlide
        (each via through table with sequence_number)
```

#### IWTSlide (abstract base for all IWT slides)
```
Fields: background_image, pass_text, fail_text, fail_again_text,
        static_text + audio + sync_file,
        question (HTML),
        interactive_text + audio + sync_file
```

#### IWTDNDSlide (drag-and-drop)
```
Inherits: IWTSlide
Children: DNDQuestion (question text + answer text)
```

#### IWTHighlightSlide (text highlighting)
```
Inherits: IWTSlide
Children: M2M to HighlightAnswer (color + text)
Note: Student highlights specific words/sentences in the passage
```

#### IWTTextAnswerSlide (free text response)
```
Inherits: IWTSlide
Fields: rubric (FK)
```

#### IWTSummarySlide (summary writing)
```
Inherits: IWTSlide
Fields: text (FK to InstructionalText), rubric (FK), tip (FK to ScaffoldedTip),
        prompt_id, reading_id
```

Example IWT fixture:
```json
{
  "model": "twilight.iwt",
  "fields": {
    "week": 1,
    "title": "The Power to Move",
    "level": 3,
    "_id": "f225e8a5a04a4970a160cb019ac7c28c",
    "intro_animation": "f225e8a5a04a4970a160cb019ac7c28c/AVA232205.mp4"
  }
}
```

An IWT passage is composed of ordered slides:
1. Highlight slides (identify causes/effects, main ideas)
2. DND slides (drag words to correct categories)
3. Text answer slides (short written responses)
4. Summary slide (write a summary with scaffolded tips)

---

### Sort Models

**Source**: `/docs/classview/CMS/apps/sort/models.py`

Word study sorting activities (designed for Words Their Way but used across products).

#### Sort
```
CouchDB: SerializingCouchModel
Fields: subskill (FK), day (FK), level, title, audio,
        category (Interactive Sort / Writing Sort),
        instructional_audio, instructional_text, background_image,
        extra_practice (bool), category_description, skills, description,
        vocabulary_words, prompt_text, assign_with, appropriate_for, lexile
Slides: M2M to DragAndDrop through SortDragAndDropSlide (with sequence_number)
```

#### DragAndDrop
```
CouchDB: SerializingCouchModel
Fields: subskill (FK), slide_name, title, audio,
        slide_type (DND Text / DND Picture / DND Combined),
        instructional_audio, instructional_text, background_image
Children: Question and Answer objects
```

#### Question (sort-specific)
```
Fields: draganddrop (FK), question, instructional_audio, small_image, large_image,
        sequence_number, answer_sequence, related_text
```

#### Answer (sort-specific)
```
Fields: draganddrop (FK), answer, instructional_audio, small_image, large_image,
        sequence_number, is_example (bool)
```

---

### Essay & Writing Models

**Source**: `/docs/classview/CMS/apps/slide_types/models.py`

#### Essay
```
CouchDB: database='curriculum'
Fields: name, title, subskill (FK), prompt (HTML), rubric (FK), week (FK),
        tip (FK to ScaffoldedTip), app_tip, prompt_id, extra_practice (bool)
Children: EssayInstructionSection (writing stages: label + InstructionalText + sequence)
Scoring: M2M to Tip through EssayScoring (tip + trait + score 1-6)
         M2M sub_scoring through EssaySubScoring (tip + trait + score 1-5)
```

#### Paragraph
```
CouchDB: database='curriculum'
Fields: name, title, subskill (FK), prompt (HTML), instruction (FK to InstructionalText),
        rubric (FK), week (FK, unique), tip (FK to ScaffoldedTip), prompt_id,
        category (Paragraph / Library Response Prompts)
```

#### InstructionalText
```
CouchDB: database='curriculum'
Fields: title, text (HTML)
Children: InstructionalLink (title, text, parent_link self-FK, tag)
Note: Reusable instructional content blocks used by Essay, Paragraph, ScaffoldedTip
```

#### ScaffoldedTip
```
Source: /docs/classview/CMS/apps/scaffolded_tips/models.py
Fields: Extensive FK pairs (tip + subtip) to InstructionalText covering:
        grammar, spelling, redundancy, transitions, word_choice, sentence_variety,
        evidence, audience, development, organization, thesis, and many more
Note: Powers the automated writing feedback system
```

---

### Classroom & User Models

**Source**: `/docs/classview/CMS/apps/classroom/models.py` (~1094 lines)

#### Instructor
```
CouchDB type: 'instructor'
Inherits: PlainTextPasswordManaged (username, AES-encrypted password, salt, SHA1 hash)
Fields: first_name, middle_initial, last_name, title, email, school (FK)
```

#### Student
```
CouchDB type: 'student'
Inherits: PlainTextPasswordManaged
Fields: first_name, middle_initial, last_name, student_id, gender,
        english_proficiency, ethnicity, meal_program, migrant_status,
        special_services, economically_disadvantaged,
        image, active (bool), show_in_reports, test_account (bool),
        student_school (FK to School)
Encrypted: first_name, middle_initial, last_name, student_id, password
           (Pearson AES encryption for PII)
CouchDB database: '{student_id}_{classroom_id}'
Meta documents: _meta, _teacher_meta, _server_meta (stored in student's CouchDB)
Validation: student_id must be unique within a district
```

#### Classroom
```
CouchDB type: 'classroom'
Fields: instructor (FK), school (FK), curriculum (FK to UnitSet), books (FK to BookSet),
        name, server (FK to ClassroomServer), grade (FK),
        planned (bool), active (bool), activated_datetime, deactivated_datetime,
        show_in_reports, students (M2M through ClassroomStudent)
```

#### ClassroomServer
```
CouchDB type: 'server'
Fields: mac_address (unique), school (FK)
CouchDB database: 'server-{mac_address}'
Note: Physical Mac Mini in the classroom that syncs CouchDB
```

#### ClassroomStudent (through model)
```
Fields: student (FK), classroom (FK), created_datetime, deactivated_datetime
Managers: ActiveClassroomStudentManager, InactiveClassroomStudentManager
Note: Students can be activated/deactivated in classrooms
```

Example fixture:
```json
{
  "model": "classroom.instructor",
  "fields": {
    "last_name": "Krabappel",
    "first_name": "Edna",
    "username": "edna-krabappel",
    "password": "xrv15mcp6o"
  }
}
```

---

### Customer Organization Models

**Source**: `/docs/classview/CMS/apps/customers/models.py`

```
Customer
  └── District
        └── School
              └── Classroom (also in classroom app)
```

#### License
```
Fields: identifier, purchase_date, grade (FK), district (FK), count
```

#### UserRole
```
Fields: user (FK to auth.User), level (EX/ST/DT/SC/CL), content_type + object_id (generic FK)
Levels: EXEC > STATE > DISTRICT > SCHOOL > CLASSROOM
```

---

### Reporting & Progress Models

**Source**: `/docs/classview/CMS/apps/reporting/models.py`

#### ReportWeek
```
Fields: guid (PK), unitset_name, unit_id, week_id, seq_num
```

#### ReportMetaData
```
Fields: guid (PK), origin_type (SS=Subskill / AS=Assignment), name, type, report_type, parent
```

#### ReportResult
```
Fields: student (FK), origin (FK to ReportMetaData),
        score, max_score, percentage,
        week (FK to ReportWeek), report_type, classroom (FK)
Note: The main progress tracking record -- one per student per scored item
```

#### BookMetaData
```
Fields: guid (PK), title, author, lexile_level, word_count
```

#### BookReadRecord
```
Fields: student (FK), book (FK to BookMetaData),
        words_read, last_read, completed (bool), percentage
Note: Tracks reading progress per student per book
```

---

### Assessment Models

**Source**: `/docs/classview/CMS/apps/unit_benchmark/models.py`

#### UnitBenchmark
```
Fields: title, unit (FK),
        category (Unit Benchmark / Reading Check / GRADE Assessment),
        sub_category (BOY / MOY / EOY)
Slides: Generic FK-based slide collections (pretest, posttest, example, assessment, tutorial)
Note: Uses ContentType + object_id for polymorphic slide references
```

**Source**: `/docs/classview/CMS/apps/study_plan/models.py`

#### StudyPlan
```
CouchDB: SerializingCouchModel
Fields: title, subject, week (FK),
        practices (M2M to StudyPlanPractice), subskills (M2M)
Slides: pretest_slides (Generic FK), posttest_slides (Generic FK)
```

#### StudyPlanPractice
```
Fields: subskill (FK), assessment_slides, example_slides, tutorial_slides
        (all Generic FK-based)
```

---

### Configuration Models

**Source**: `/docs/classview/CMS/apps/configuration/models.py`

#### ReadingComprehensionMultiplier
```
Fields: grade (FK), multipliers for: iwt, time_to_read, unit_benchmark, weekly_reading_check,
        grade_assessment, rata_listening_comprehension, rata_vocabulary,
        rata_sentence_comprehension, rata_passage_comprehension, vocabulary
```

#### SummaryWritingOffset / CriticalResponseOffset
```
Fields: base_score (0-4), offset
Note: Score adjustment tables
```

#### Metadata (Singleton)
```
Fields: server_version, ios_app_version
```

---

### Support Models

#### Rubric (`rubric/models.py`)
```
Rubric: name, questions (M2M to RubricQuestion through RubricQuestionThrough with sequence_number + trait)
Traits: IDEAS, WC (Word Choice), ORG, CONV, FLUENCY, VOICE, TopicFocus, TopicDevelopment, etc.
```

#### Phonics (`phonics/models.py`)
```
Phonic: week (FK), gle_level (K-12), category, assignment_zip_file (JsonFileField), book (FK)
FoundationalReadingSkill: title, week (FK), gle_level, category (FRS / Word Reading)
```

#### Student Resources (`student_resources/models.py`)
```
BookClub: day (FK, unique), title, M2M to TextSlide + ImageSlide
RoutineCard: day (FK, unique), title, M2M to TextSlide + ImageSlide
Standard: day (FK, unique), title, M2M to TextSlide + ImageSlide
Note: All three follow same pattern with copy-to-day functionality
```

---

## Content Pipeline

### Authoring Flow

```
1. AUTHOR in Django Admin
   Content editors create/edit via Django admin interface
   Rich text fields use TinyMCE editor
   Images upload to CouchDB via CouchDBImageField/CouchDBFileField

2. SAVE to PostgreSQL
   Django ORM saves to PostgreSQL (authoritative store)
   Model validation runs (unique constraints, required fields)

3. AUTO-SYNC to CouchDB
   SerializingCouchModel.save() automatically serializes to CouchDB
   _id (UUID) and _rev (revision) track document identity and conflicts
   Child model saves cascade up: e.g., saving an Answer triggers
   DragAndDrop.save(force_couch_push=True) to update parent doc

4. CURRICULUM PUSH (manual)
   Admin triggers CurriculumPush for specific content
   System gathers all related slide IDs via _get_promotion_dict()
   Creates CouchDB replication documents from source -> target server
   CouchDBReplicator tracks replication status

5. CLASSROOM SYNC (automatic)
   ClassroomServer (Mac Mini) syncs from target CouchDB
   iPads sync from ClassroomServer via CouchDB replication
   Student databases ({student_id}_{classroom_id}) hold per-student data
   Offline-first: iPads work without internet, sync when connected
```

### Delta Updates

When a child model is saved, it cascades up:
- Answer.save() -> DragAndDrop.save(force_couch_push=True)
- DNDQuestion.save() -> IWTDNDSlide.save(force_couch_push=True)
- WordSlamQuestion.save() -> word_slam.change_revision()

This ensures the parent CouchDB document's `_rev` changes, triggering replication.

### Multi-Product Content Sharing

The `Associate*` models allow content reuse across products:
- `AssociateIWT`: IWT -> different product/day/level
- `AssociateEssay`: Essay -> different product/week
- `AssociateSort`: Sort -> different product/day/level
- `AssociateRATABook`: RATA -> different product
- `AssociateDailyAssignment`: DailyAssignment -> different product/day
- `AssociateWordSlam`: WordSlam -> different product/week

---

## API Endpoints

### REST API (Tastypie)

**Base**: `/api/v0.1/`

| Endpoint | Resource | Methods |
|----------|----------|---------|
| `/api/v0.1/student/` | StudentResource | GET, POST |
| `/api/v0.1/classroom/` | ClassroomResource | GET, POST, PUT, DELETE |

StudentResource excludes `id`, `_id`, `_rev` and includes full classroom data.

### Reporting Endpoints

**Base**: `/reporting/`

| URL | View |
|-----|------|
| `/reporting/` | reports (main dashboard) |
| `/reporting/data/student-distribution/` | student_distribution |
| `/reporting/data/scores-by-week/` | scores_by_week |
| `/reporting/data/books/` | books |
| `/reporting/data.csv` | csv_data (export) |
| `/reporting/data/students/scores-by-week/` | scores_by_week_and_student |
| `/reporting/accessible-rooms/` | accessible_rooms |
| `/reporting/accessible-students/` | accessible_students |
| `/reporting/groups/` | groups |

### Main URL Routes

| URL | Destination |
|-----|-------------|
| `/api/` | Tastypie REST API |
| `/admin/` | Django admin |
| `/cca/` | Custom content admin |
| `/reporting/` | Reporting dashboard |
| `/authenticate/` | Authentication |

---

## Key Questions Answered

### How is a "book" represented?

A **Book** is a `SerializingCouchModel` stored in the `library_meta` CouchDB database. It has:
- **Metadata**: title, author, blurb, lexile_level (integer), word_count, page_count, fiction (bool), level, gender, ethnicity
- **Content**: epub file (encrypted EPUB stored via FileField), cover image (512x768)
- **Classification**: categories (M2M), genres (M2M to BookGenre), areaofinterests (M2M), book_type (R=RATA trade, A=Academic, I=Interface anthology)
- **Media**: audio file, videos (M2M to Video)
- **Organization**: sets (M2M to BookSet) -- classrooms are assigned BookSets which determine available books

Books are grouped into **BookSets**, and each **Classroom** has one BookSet assigned. The book's EPUB is stored in the `library_epub` CouchDB database and synced to classroom servers for offline reading.

### How is an "assignment" / "interactive reading passage" structured?

**Interactive Reading Passages (IWT)** are the core adaptive reading experience:
- Each **Week** has IWT passages at up to **9 reading levels** (level 1 = lowest, level 9 = highest)
- Each **IWT** has an ordered sequence of 4 slide types:
  1. **IWTHighlightSlide** -- Student highlights words/sentences (e.g., identify causes/effects)
  2. **IWTDNDSlide** -- Drag-and-drop categorization
  3. **IWTTextAnswerSlide** -- Free text response with rubric scoring
  4. **IWTSummarySlide** -- Summary writing with scaffolded tips and auto-scoring
- Each slide has: static_text (passage text), question (prompt), pass/fail/fail_again feedback, background_image, audio + sync files
- The IWT intro can include an animation (MP4 video)

**Assignments** more broadly include 7 categories visible in the student UI:
1. **Interactive Reading** -- IWT passages (above)
2. **Study Plan** -- Pre/post test with practice tutorials
3. **Vocabulary, Word Study, Reading Comprehension** -- Sort activities + MultipleChoiceSlides
4. **iPractice** -- Phonics/FRS activities (ZIP files)
5. **Writing** -- Essay and Paragraph assignments with rubric scoring
6. **Monitor Progress** -- UnitBenchmark assessments (BOY/MOY/EOY)
7. **Information** -- Student resources (BookClub, RoutineCard, Standard)

### How are vocabulary words stored?

Two systems:

1. **GlossaryWord + GlossaryDefinition** (CouchDB database: 'curriculum')
   - `GlossaryWord`: word text, animation file, photo, illustration
   - `GlossaryDefinition`: Bilingual (English + Spanish), each with HTML definition, audio file, and sync file for TTS
   - Multiple definitions per word (sequence_num ordered)

2. **Vocab Activity** (daily vocabulary instruction)
   - Each Day has a Vocab activity with ordered slides (PollSlide, TextSlide, ProjectorSlide, ImageSlide)
   - VocabPollActivity through model includes a `vocab_word` field linking polls to specific words
   - Teacher presents words through projector/text slides, students interact via poll slides

3. **WordSlam** (vocabulary game, weekly)
   - Syllable-based word building game
   - `tiles`: comma-delimited syllable tiles
   - `WordSlamQuestion`: question prompts where answers are syllable sequences

### How is student progress tracked?

**ReportResult** is the primary progress record:
- Links: student + origin (ReportMetaData) + week (ReportWeek) + classroom
- Values: score, max_score, percentage, report_type
- ReportMetaData.origin_type: SS (SubSkill-level) or AS (Assignment-level)

**BookReadRecord** tracks reading:
- Links: student + book (BookMetaData)
- Values: words_read, last_read timestamp, completed (bool), percentage

**Per-student CouchDB databases** (`{student_id}_{classroom_id}`) store:
- `_meta`: Student metadata document
- `_teacher_meta`: Teacher-assigned metadata
- `_server_meta`: Server sync metadata
- All student work/responses synced from iPad

**Score calculation** uses configurable multipliers per grade level (ReadingComprehensionMultiplier) and score offsets (SummaryWritingOffset, CriticalResponseOffset).

### What's the relationship between units, lessons, and assignments?

```
Product
  └── UnitSet (the curriculum package sold to a school)
        └── Unit (thematic unit, 1-10, e.g., "Adventures in Reading")
              └── Week (1-50 per unit, the main organizational unit)
                    ├── Day 1-5 (daily lesson plans)
                    │     └── 8 Activities per day (the "lessons"):
                    │           Vocab, TimeToRead, RATA, ClassroomConversations,
                    │           WholeGroup, WorkTime, WrapUp, DailyAssignment
                    │
                    ├── IWT at 9 levels (adaptive reading -- the main "assignment")
                    ├── WordSlam (vocabulary game)
                    ├── Essay (writing assignment)
                    ├── Paragraph (shorter writing)
                    ├── WritingPromptSlide (journal prompts)
                    └── StudyPlan (assessment + practice)
```

Key insight: **Days contain lessons** (teacher-led activities), while **Weeks contain assignments** (student-independent work like IWT, Essay, WordSlam). A student's IWT level is adaptive -- they get the passage at their reading level, not a fixed assignment.

### How does the content pipeline work?

1. **Author**: Content editors use Django admin with TinyMCE rich text editing. Images/audio/video upload via CouchDBFileField/CouchDBImageField directly to CouchDB.

2. **Store**: PostgreSQL is the authoritative database. SerializingCouchModel auto-syncs every save() to CouchDB. Child saves cascade up to parent documents (delta updates).

3. **Publish**: Admin triggers CurriculumPush, which creates CouchDB replication jobs from the authoring CouchDB to target classroom CouchDB servers. CouchDBReplicator tracks status.

4. **Deliver**: Each classroom has a ClassroomServer (Mac Mini) that syncs CouchDB. iPads sync from the classroom server. Students work offline; data syncs when connected.

5. **Multi-product**: Associate* models allow one piece of content to appear in multiple products at different days/levels without duplication.

---

## Appendix: Reading Level System

**9 Reading Levels** (READING_LEVEL_CHOICES 1-9):
- Used by IWT (each week has passages at all 9 levels)
- Used by Sort activities
- Students are assigned a level; content adapts

**GLE Levels** (GLE_LEVEL_CHOICES K-12):
- Used by Phonics/FoundationalReadingSkill
- Kindergarten through 12th grade

**Lexile Levels** (integer on Book model):
- Standard reading difficulty measure
- Stored as integer (e.g., 9000 in fixture data)

---

## Appendix: CouchDB Document Types

| COUCHDB_TYPE | Model | Database |
|-------------|-------|----------|
| `time_to_read` | TimeToRead | curriculum |
| `rata` | ReadAloudThinkAloud | curriculum |
| `vocab` | Vocab | curriculum |
| `classroom_conversations` | ClassroomConversations | curriculum |
| `whole_group` | WholeGroup | curriculum |
| `work_time` | WorkTime | curriculum |
| `wrap_up` | WrapUp | curriculum |
| `dailyassignment` | DailyAssignment | curriculum |
| `word_slam` | WordSlam | curriculum |
| `pollslide` | PollSlide | curriculum |
| `textslide` | TextSlide | curriculum |
| `projectorslide` | ProjectorSlide | curriculum |
| `imageslide` | ImageSlide | curriculum |
| `instructor` | Instructor | - |
| `student` | Student | per-student |
| `classroom` | Classroom | - |
| `server` | ClassroomServer | per-server |
