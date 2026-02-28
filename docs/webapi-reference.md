# ClassView WebAPI Reference

Comprehensive reference for the Savvas I-LIT ClassView backend API. This document is intended for AI agents building a replica frontend who need to understand what data the original API provides and in what shape.

**Source code location:** `docs/classview/WebAPI_Services/Services_SourceCode/ClassView.iLit.WebAPI.BTS2019/`
**DynamoDB schemas:** `docs/classview/DB_SetupScripts/000 Setup Tables/`

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Authentication & Session Model](#authentication--session-model)
3. [Standard Request/Response Format](#standard-requestresponse-format)
4. [Content Delivery Model](#content-delivery-model)
5. [PED Controller Endpoints](#ped-controller-endpoints) (Student/Teacher App API)
6. [CCA Controller Endpoints](#cca-controller-endpoints) (Admin Portal API)
7. [RPT Controller Endpoints](#rpt-controller-endpoints) (Reporting API)
8. [DynamoDB Table Schemas](#dynamodb-table-schemas)
9. [Key Enumerations](#key-enumerations)
10. [Data Flow Diagrams](#data-flow-diagrams)

---

## Architecture Overview

- **Framework:** ASP.NET Web API 2 (.NET Framework)
- **Database:** Amazon DynamoDB (28 tables)
- **Content Storage:** S3/CDN (zipped JSON, images, audio, video)
- **Authentication:** Token-based with SAML SSO via Pearson Rumba
- **Routing:** Flat URL pattern -- every method maps to `POST /{MethodName}` (not RESTful)
- **Base URL pattern:** `{ENVDOMAIN}/WebAPI/{MethodName}`
- **Products supported:** `ilit`, `myeld` (myELD), `wtw` (Words Their Way)

### Controllers

| Controller | Prefix | Purpose | ~Methods |
|-----------|--------|---------|----------|
| PEDController | (none) | Student & teacher app API | ~100 |
| CCAController | `iPortal_` | Admin portal (iPortal) | ~130 |
| RPTController | `iRPT_` | Reporting & analytics | ~60 |

---

## Authentication & Session Model

### Token Lifecycle

1. Client calls `GetServiceTokenID` to get a session token
2. Client calls `ValidateLoginForStudent` or `ValidateLoginForInstructor` with username/password
3. Every subsequent request includes `TokenID` in the request body
4. Server validates token via `ServiceTokenManager.ValidateServiceToken()` on every call
5. Tokens stored in the `SYSTEM_TOKEN` DynamoDB table

### SAML SSO (Rumba)

- `ValidateLoginForStudentSAML` / `ValidateLoginForInstructorUsingSAML` accept a `RumbaTicketID` + `ServiceURL`
- Rumba login URL: `https://sso.rumba.pk12ls.com/sso/login`
- Rumba SSO logout: `https://sso.rumba.pk12ls.com/sso/logout`
- WAYF URL: `https://wayf.rumba.pk12ls.com/wayf/`

### Class Sessions (Teacher)

Teachers start/stop class sessions via `SetSession`:
- Input: `SessionState` (enum: Start=1, Stop=2), `GroupID`
- Students poll `GetClassStatus` to know if class is in session
- Class status includes `CurrentAction`: `B` (Broadcast), `BZ` (Buzz), `AP` (AdHoc Poll), `S` (Survey)

---

## Standard Request/Response Format

### Base Input Model (Common_IVM)

Every request to the PED controller extends this base:

```typescript
interface Common_IVM {
  TokenID: string;          // Session token from GetServiceTokenID
  DeviceTimeStamp: string;  // Client timestamp
  CallerUserID: string;     // Current user's ID
  CallerClassID: string;    // Current class ID
  DueDate?: string;         // Optional, used for assignments
}
```

### Student-Scoped Input (StudentItemCommonInfo_IVM)

For student-specific operations:

```typescript
interface StudentItemCommonInfo_IVM extends Common_IVM {
  ClassID: string;
  StudentID: string;
  ItemID: string;
  GroupID: string;
}
```

### Standard Response Wrapper (ServiceResponse)

Every API response is wrapped in:

```typescript
interface ServiceResponse {
  Status: "200" | "500";
  Error: {
    ErrorCode: string;
    ErrorTechDescription: string;
    ErrorUserDescription: string;
  } | null;
  Content: any | null;  // The actual payload, varies by endpoint
}
```

---

## Content Delivery Model

Content (passages, books, assignments) is NOT served directly by the API. Instead:

### Step 1: Login returns class info

`ValidateLoginForStudent` returns a list of `ClassInfo` objects, each with a `ProductGradeID`.

### Step 2: Get content URLs

`GetGradeInfoInDetail` accepts a `ProductGradeID` and returns CDN URLs:

```typescript
interface GetGradeInfoInDetail_OVM {
  ProductGradeID: string;
  GradeCode: string;           // e.g., "g6", "g7"
  GradeDisplayName: string;
  RevisionNumber: string;
  TotalUnits: string;
  TotalWeeksWithInGrade: string;
  TotalLessonsWithInGrade: string;
  UnitsWeeksDetails: string;   // JSON: int[,] mapping units to weeks

  // CDN URLs for content packages
  ContentBaseURL: string;      // Base URL for all content
  JsonZipURL: string;          // Assignment/lesson JSON data
  ImageZipURL: string;         // Assignment/lesson images
  AudioZipURL: string;         // Audio content
  VideoZipURL: string;         // Video content
  LibraryJsonZipURL: string;   // Digital library book metadata
  LibraryImageZipURL: string;  // Book cover images
  libraryPath: string;         // Path prefix for library content
  assignmentPath: string;      // Path prefix for assignment content
}
```

### Step 3: Get Table of Contents

`GetTOCItems` maps internal ItemIDs to CMS content IDs:

```typescript
interface GetTOCItems_OVM {
  ItemID: string;      // Internal DB item ID
  CMSItemID: string;   // Content Management System item ID (used to locate files in CDN)
}
```

### Content Architecture

The client downloads ZIP packages from CDN, then uses `CMSItemID` to locate specific content within the unzipped files. Content is organized by:
- **Grade** (g3-g12) -> **Unit** (1-7) -> **Week** -> **Day/Lesson**
- **Library** books are separate, organized by ItemID/CMSItemID

Grade band mapping:
| Band | Code | Target Grades |
|------|------|---------------|
| Primary | `gbp` | K, 1, 2 |
| Elementary | `gbe` | 3, 4, 5 |
| Middle | `gbm` | 6, 7, 8 |
| High | `gbh` | 9, 10, 11, 12 |

---

## PED Controller Endpoints

All endpoints are `POST`. Input/output types are documented below.

### Authentication & Setup

| Endpoint | Input | Output | Description |
|----------|-------|--------|-------------|
| `GetServiceTokenID` | `{ }` | Token string | Get session token |
| `ValidateLoginForStudent` | `ValidateLogin_IVM` | `ValidateLogin_OVM` | Student login |
| `ValidateLoginForStudentSAML` | `ValidateLoginSAML_IVM` | `ValidateLogin_OVM` | Student SAML SSO login |
| `ValidateLoginForInstructor` | `ValidateLogin_IVM` | `ValidateLogin_OVM` | Teacher login |
| `ValidateLoginForInstructorUsingSAML` | `ValidateLoginSAML_IVM` | `ValidateLogin_OVM` | Teacher SAML SSO login |
| `GetGradeInfoInDetail` | `{ ProductGradeID }` | `GetGradeInfoInDetail_OVM` | Get content CDN URLs |
| `GetTOCItems` | `{ ProductGradeID }` | `GetTOCItems_OVM[]` | Get ItemID-to-CMSItemID mapping |
| `GetDistrictList` | `{ DistrictID }` | District list | List districts |
| `GetGradeList` | `Common_IVM` | Grade list | List available grades |
| `GetProductGradeList` | `{ ProductID }` | Product grade list | List product-grade combos |

#### ValidateLogin_IVM (Login Input)

```typescript
interface ValidateLogin_IVM extends Common_IVM {
  UserName: string;
  Password: string;
  ProductCode: string;
  IsCallerProjectionApp: string;
  CallerAppType: string;         // "webclient", "ios", "andrd", etc.
  MasterProductType: string;     // "ilit", "myeld", "wtw"
  CurrentAppVersionNo: string;
  CurrentAppZipRevisionNo: string;
}
```

#### ValidateLogin_OVM (Login Output)

```typescript
interface ValidateLogin_OVM {
  UserID: string;
  UserFullName: string;
  UserRole: string;              // "S" (student), "I" (instructor), etc.
  DistrictID: string;
  RumbaUserID: string;
  PSDistrictID: string;
  MaxCacheSizeInMB: number;
  AppZipUrl: string;
  AppZipRevisionNo: number;
  ApplicationVersionNo: string;
  DisableGAnLRSLogging: string;
  DisableContentLogging: string;
  IsAutoReadBook: number;
  IsAutoCompleteGradeAssessment: number;
  ShowOfflineAlert: string;
  ForcedLogoutEnabled: boolean;
  ForcedLogoutIdleTimeout: number;
  IncrementalSaveDuration: number;
  AllowChromeAppLoaderPopup: boolean;
  AllowRecommendedBooksCaching: boolean;
  EnableClassCompletionScreenTab: string;
  DebugWindowShow: boolean;

  ClassInfo: ValidateLogin_ClassInfo_OVM[];  // List of enrolled classes
}

interface ValidateLogin_ClassInfo_OVM {
  ClassID: string;
  ProductGradeID: string;
  ClassName: string;
  ProductCode: string;
  ClassRevisionNumber: number;
  CacheDurationInDays: number;
  ProductID: number;
  GradeID: number;
  TargetGradeCode: string;       // e.g., "g6"
  ProductDisplayCode: string;
  ClassStartDate: string;
  ClassExpirytDate: string;
  ClassStatus: string;           // "Active", "Planned", etc.
  SectionName: string;
  ClassDisplayCode: string;
  ClassStateStandardCode: string;
  HideClassForDisplay: string;
  DisplayOrder: string;
  UserRoleInClass: string;
  ClassGroupID: string;
  Period: string;
  LocalServerAddress: string;
  DeploymentOptionNumber: string;
  IsSubstituteTeacherActive: number;
}
```

### Library (Digital Library / eBook Reader)

| Endpoint | Input | Output | Description |
|----------|-------|--------|-------------|
| `GetLibraryProgress` | `StudentItemCommonInfo_IVM` | `LibraryProgress_OVM` | Get reading progress for a specific book |
| `GetLibraryProgressSummary` | `Common_IVM` | `GetLibraryProgressSummary_OVM` | Get aggregate reading stats |
| `GetLibraryProgressDetailForClass` | `Common_IVM` | Per-student library progress | All students' library progress for a class |
| `SaveLibraryProgress` | `SaveLibraryProgress_IVM` | Success/fail | Save reading position and word count |
| `SetCurrentBookForStudent` | `StudentItemCommonInfo_IVM` | Success/fail | Set student's currently reading book |
| `GetCurrentBookForStudent` | `StudentItemCommonInfo_IVM` | Current book info | Get student's currently reading book |
| `GetRecommendedBooks` | `RecommendedBooks_IVM` | `GetRecommendedBooks_OVM[]` | Get personalized book recommendations |
| `GetListOfReservedBooks` | `Common_IVM` | Reserved book list | Books reserved by the teacher |
| `GetUserFeedbackforAllBooks` | `Common_IVM` | Feedback list | All book review feedback |
| `SaveBookReviewFeedback` | `SaveBookReviewFeedback_IVM` | Success/fail | Save a book review |
| `DeleteBookReviewFeedback` | `DeleteBookReviewFeedback_VM` | Success/fail | Delete a book review |
| `GetBookReviewFeedback` | `GetBookReviewFeedback_IVM` | Book review data | Get review for a specific book |
| `AssignBookForClass` | `AssignBook_IVM` | Success/fail | Teacher assigns a RATA book |

#### LibraryProgress_OVM (Reading Progress Output)

```typescript
interface LibraryProgress_OVM {
  ItemID: string;
  ProgressDataSummary: string;    // JSON: { bookCompleted: boolean }
  ProgressDataDetails: string;    // JSON: { chapNo: number, sentNo: number, "font-size": string }
  TotalNumberOfWordsRead: number;
  TotalNumberOfPagesRead: number;
  TotalNumberOfSecondsSpent: number;
}

// Extended version also includes:
interface LibraryProgress_OVM_Extended extends LibraryProgress_OVM {
  ItemAttemptID: string;
  DetailsJSON: { chapNo: number; sentNo: number; "font-size": string };
  SummaryJSON: { bookCompleted: boolean };
  WordCountObj: Array<{
    UN: number;   // UnitNumber
    WN: number;   // WeekNumber
    BT: number;   // BookType (1=TTR, 2=RATA)
    WC: number;   // WordCount
    TT: number;   // TimeTaken (ms)
  }>;
}
```

#### SaveLibraryProgress_IVM

```typescript
interface SaveLibraryProgress_IVM extends StudentItemCommonInfo_IVM {
  ProgressDataSummary: string;        // JSON string
  ProgressDataDetails: string;        // JSON string
  TotalNumberOfWordsRead: number;
  TotalNumberOfSecondsSpent: number;
  BookLexileLevel: number;
}
```

#### GetLibraryProgressSummary_OVM (Aggregate Stats)

```typescript
interface GetLibraryProgressSummary_OVM {
  TotalNumberOfWordsRead: number;
  TotalNumberOfPagesRead: number;
  TotalTimeSpent: number;            // seconds
  TotalBooksCompleted: number;
  BookItemIDs: string[];             // All books the student has read
  BookCompletedItemIDs: string[];    // Books the student finished
  InterestInventoryInfoProvided: string;  // "BOY", "MOY", "EOY", or "None"
  InterestInventoryInfoProvidedDates: string;  // JSON with B_DT, M_DT, E_DT
}
```

#### GetRecommendedBooks_OVM

```typescript
interface GetRecommendedBooks_OVM {
  CMSItemID: string;    // CMS ID of the recommended book
  TotalPoints: number;  // Recommendation score
}
```

### Notebook (Notes, Word Bank, Journal)

| Endpoint | Input | Output | Description |
|----------|-------|--------|-------------|
| `GetNotelist` | `GetNoteList_IVM` | `GetNoteList_OVM` | List notes with incremental sync |
| `GetNoteInfo` | `NoteInfo_IVM` | Note detail | Get full note content |
| `SaveNote` | `SaveNote_IVM` | Success/fail | Create or update a note |
| `DeleteNote` | `DeleteNote_IVM` | Success/fail | Delete a note |
| `SetCommentForNote` | `NoteComment_IVM` | Success/fail | Teacher adds comment to a note |

#### Note Types (NoteType enum)

| Value | Type | Description |
|-------|------|-------------|
| 1 | `journal` | Student journal entries |
| 2 | `wordbank` | Saved vocabulary words |
| 3 | `classnotes` | Teacher-pushed class notes |

#### SaveNote_IVM

```typescript
interface SaveNote_IVM extends Common_IVM {
  NoteID: string;           // Empty for new, existing ID for update
  NoteType: string;         // "1" (journal), "2" (wordbank), "3" (classnotes)
  NoteTitle: string;
  NoteText: string;
  NoteRefID: string;        // Reference item ID (e.g., book or lesson)
  RefUnitNumber: string;
  RefOtherData: string;
  ShortNoteText: string;    // Truncated preview text
}
```

#### GetNoteList_IVM / GetNoteList_OVM (Incremental Sync)

```typescript
interface GetNoteList_IVM extends Common_IVM {
  NoteRefID: string;
  NoteType: string;
  MaxAttemptRevisionID: number;  // For incremental sync -- only get notes newer than this
  DataRangeType: string;
}

interface GetNoteList_OVM {
  Data: Array<{
    NoteID: string;
    UserID: string;
    ClassID: string;
    NoteType: string;
    NoteTitle: string;
    NoteRefID: string;
    RefUnitNumber: number;
    RefOtherData: string;
    ShortNoteText: string;
    RevisionId: number;
    IsDeleted: number;           // 0 or 1
    IsTeacherCmtAvl: number;     // 0 or 1 (teacher comment available)
  }>;
  MaxRevisionNumber: string;     // Use this for next incremental sync
}
```

### Assignments & Grading

| Endpoint | Input | Output | Description |
|----------|-------|--------|-------------|
| `GetGradebookForStudent` | `GradeBookForStudentV2_IVM` | `GradebookForStudent_OVM` | Get student's gradebook (incremental) |
| `GetGradebookAttemptDataForStudApp` | `GradebookAttemptDateV2_IVM` | Attempt data | Student-side gradebook details |
| `SaveAttemptDataForGradeableItem` | `SaveAttemptDataForGradeableItem_IVM` | Success/fail | Save student's work on an assignment |
| `GetAttemptDataForGradeableItem` | `GetAttemptDataForGradeableItem_IVM` | `GetAttemptDataForGradeableItem_OVM` | Get attempt data for review |
| `AssignGradeableItem` | `AssignGradeableItem_IVM` | Success/fail | Teacher assigns an item |
| `RemoveGradeableItem` | `RemoveGradeableItem_IVM` | Success/fail | Teacher removes an assignment |
| `SetGradeableItemList` | `SetGradeableItemList_IVM` | Success/fail | Batch assign items |
| `GetGradebookForInstructor` | `GradebookForInstructorV2_IVM` | Instructor gradebook | Teacher view of all students' grades |
| `GetGradebookAttemptData` | `GradebookAttemptDateV2_IVM` | Attempt details | Teacher view of attempt details |
| `SetScoreForGradeableItem` | `SetScoreForGradeableItem_IVM` | Success/fail | Teacher scores an item |
| `SetPartialScoreForGradeableItem` | `SetScoreForGradeableItem_IVM` | Success/fail | Partial scoring |
| `GetIWTTotalWordCount` | `Common_IVM` | Word count | Interactive Writing Tool word count |

#### GradebookForStudent (Incremental Sync)

```typescript
interface GradeBookForStudentV2_IVM extends Common_IVM {
  MaxAttemptRevisionID: number;  // 0 for full sync, > 0 for incremental
  DataRangeType: string;
}

interface GradebookForStudent_OVM {
  GradeBookData: Array<{
    SID: string;    // StudentID
    IID: string;    // ItemID (the assignment)
    IAID: string;   // ItemAttemptID (unique attempt)
    ARID: number;   // AttemptRevisionID
  }>;
  MaxRevisionNumber: string;  // Use for next sync
}
```

#### SaveAttemptDataForGradeableItem_IVM

```typescript
interface SaveAttemptDataForGradeableItem_IVM extends Common_IVM {
  StudentID: string;
  ItemID: string;                   // Assignment/assessment ID
  StudentAttemptData: string;       // JSON blob with all student answers
  SystemScore: string;              // Auto-scored result
  FinalScore: string;
  ItemCompleted: string;
  Status: number;                   // UserAttemptItemStatus enum
  StudentAttemptSummary: string;    // JSON summary
  IAID: string;                     // ItemAttemptID (empty for first attempt)
  IwtReadCheckPointScore?: number;
  IwtSummaryScore?: number;
  PreTestScore?: number;
  PractiseTestScore?: number;
  IsStudentScored: number;
  OralFluencyData?: string;         // JSON oral fluency scores
  MaxScore?: number;
  NoOfQuestionsAttempted: string;
}
```

#### GetAttemptDataForGradeableItem_OVM

```typescript
interface GetAttemptDataForGradeableItem_OVM {
  StudentAttemptData: string;       // Full JSON of student answers
  SystemScore: string;
  CompletionStatus: string;
  Comment: string;                  // Teacher comment
  StudentAttemptSummary: string;
  ItemAttemptID: string;
  FinalScore: string;
  PKTOralFluencyScore: string;
  ShowGradeExamWithAllMedia: string;
  SFB: string;                      // Score Feedback
}
```

### User Levels & Interests

| Endpoint | Input | Output | Description |
|----------|-------|--------|-------------|
| `SetUserLevel` | `UserLevel_VM` | Success/fail | Set student reading/Lexile level |
| `GetUserLevel` | `Common_IVM` | `UserLevel_OVM` | Get student reading/Lexile level |
| `GetClassUserLevel` | `Common_IVM` | `ClassUserLevel_OVM[]` | All students' levels in class |
| `GetDefaultIRLevel` | `Common_IVM` | Default IR level | Default Interactive Reader level |
| `SetDefaultIRLevel` | `SetDefaultIRLevel_IVM` | Success/fail | Set default IR level |
| `SaveInterestInventory` | `SaveInterestInventory_IVM` | Success/fail | Save student's interest survey |
| `GetInterestInventory` | `GetInterestInventory_IVM` | `GetInterestInventory_OVM` | Get interest inventory data |

#### UserLevel_OVM

```typescript
interface UserLevel_OVM {
  LexileLevel: number;
  ReadingLevel: number;
  UserLexileLevelDetails: string;    // JSON with level change history
  UserReadingLevelDetails: string;   // JSON with level change history
}
```

#### GetInterestInventory_OVM

```typescript
interface GetInterestInventory_OVM {
  SurveyResponse_BOY: string;           // Beginning of Year survey response
  StudenInterestInventory_BOY: string;  // BOY inventory data
  SurveyResponse_MOY: string;           // Middle of Year
  StudenInterestInventory_MOY: string;
  SurveyResponse_EOY: string;           // End of Year
  StudenInterestInventory_EOY: string;
}
```

### Highlights & Annotations

| Endpoint | Input | Output | Description |
|----------|-------|--------|-------------|
| `SaveHighLight` | `HighLight_VM` | Success/fail | Save highlights for a book or assessment |
| `GetHighLightInfo` | `HighLightInfo_IVM` | `HighLightInfo_OVM` | Get highlights for a book or assessment |

#### HighlightType enum

| Value | Type |
|-------|------|
| 1 | `book` -- Highlights in eBook reader |
| 2 | `assessment` -- Highlights in assignment/assessment |

#### Highlight Data Structure

```typescript
interface HighLight_VM extends Common_IVM {
  ProductGradeHighlightReferenceID: string;  // Composite key
  HighLightTitle: string;
  HighlightType: string;                     // "1" (book) or "2" (assessment)
  HighlightJsonData: string;                 // JSON array of highlights
}

// Each highlight in the JSON array:
interface HighlightEntry {
  paragraphindex: string;
  wordindex: string;
  sentenceindex: string;
  color: string;               // Highlight color (cyan, magenta, green, etc.)
}
```

### Class Management (Teacher)

| Endpoint | Input | Output | Description |
|----------|-------|--------|-------------|
| `SetSession` | `ClassSession_IVM` | Success/fail | Start/stop class session |
| `GetClassStatus` | `ClassStatus_IVM` | `GetClassStatus_OVM` | Get current class session state |
| `GetClassUserDetails` | `Common_IVM` | User details | Get all users in class |
| `GetRosterForClass` | `Common_IVM` | Roster list | Get class roster |
| `GetRosterForSpecificClass` | specific class IVM | Roster list | Get roster for a specific class |
| `GetCurrentLessonForClass` | `GetCurrentLesson_IVM` | Current lesson | What lesson is the class on |
| `SetCurrentLessonForClass` | `SetCurrentLesson_IVM` | Success/fail | Set current lesson |
| `GetCurrentWeekForClass` | `Common_IVM` | Current week | What week the class is on |
| `SetCurrentWeekForClass` | `SetCurrentWeekForClass_IVM` | Success/fail | Set current week |
| `GetClassList` | `GetClassList_IVM` | Class list | List teacher's classes |
| `UpdateClassInformation` | `UpdateClassInformation_IVM` | Success/fail | Update class details |

#### GetClassStatus_OVM

```typescript
interface GetClassStatus_OVM {
  Started: string;                  // "Y" or "N"
  CurrentAction: string;            // "B" (Broadcast), "BZ" (Buzz), "AP" (AdHocPoll), "S" (Survey)
  CurrentActionData: any;           // Dynamic -- depends on CurrentAction
  ClassCurrentActivities: {
    CurrentLessonUnit: number;
    CurrentLessonWeek: number;
    CurrentLessonDay: number;
    CurrentLessonID: string;
    CurrentRATABookID: string;      // Read Aloud / Think Aloud book
  };
}
```

### Class Groups

| Endpoint | Input | Output | Description |
|----------|-------|--------|-------------|
| `SaveClassGroup` | `SaveClassGroup_IVM` | Success/fail | Create/update a class group |
| `GetListOfClassGroups` | `Common_IVM` | Group list | List all groups in class |
| `DeleteClassGroup` | `DeleteClassGroup_IVM` | Success/fail | Delete a group |
| `SetInstructorForClassGroup` | `SetInstructorForClassGroup_IVM` | Success/fail | Assign teacher to group |
| `SetTeacherActivationForClassGroup` | `SetTeacherActivationForClassGroup_IVM` | Success/fail | Activate/deactivate teacher |

### Buzz (Classroom Discussion)

| Endpoint | Input | Output | Description |
|----------|-------|--------|-------------|
| `GetBuzzCmtDetails` | `Common_IVM` | Buzz comments | Get classroom discussion comments |
| `SetBuzzComment` | `SetBuzzComment_IVM` | Success/fail | Post a buzz comment |

### Polls

| Endpoint | Input | Output | Description |
|----------|-------|--------|-------------|
| `UpdatePoll` | `UpdateAdHocPoll_IVM` | Success/fail | Create/update an ad hoc poll |
| `GetPollList` | `Common_IVM` | Poll list | Get all polls for class |
| `GetPollInfo` | `AdHocPollInfo_IVM` | Poll detail | Get a specific poll |

### Surveys

| Endpoint | Input | Output | Description |
|----------|-------|--------|-------------|
| `SetSurvey` | `SetSurvey_IVM` | Success/fail | Submit a survey response |
| `GetSurveyResult` | `SurveyIVM` | Survey results | Get survey results |

### Projection (Teacher Screen Sharing)

| Endpoint | Input | Output | Description |
|----------|-------|--------|-------------|
| `SetProjection` | `Projection` | Success/fail | Start/stop/update projection |
| `GetProjectionData` | `Common_IVM` | Projection data | Get current projection state |
| `SetBroadcast` | `SetBroadcast_IVM` | Success/fail | Broadcast content to students |
| `GetScribbleData` | `GetScribbleData_IVM` | Scribble data | Get teacher annotations |
| `SetScribbleData` | `SetScribbleData_IVM` | Success/fail | Save teacher annotations |

### Communication (Connect Tab)

| Endpoint | Input | Output | Description |
|----------|-------|--------|-------------|
| `GetMessageList` | `GetMessageList_IVM` | Message list | Get teacher-student messages |

### Conferencing (Teacher Conferences)

| Endpoint | Input | Output | Description |
|----------|-------|--------|-------------|
| `SaveConferenceStudentData` | `SaveConferenceStudentData_IVM` | Success/fail | Save conference notes |
| `GetListOfConferenceStudentData` | `GetListOfConferenceStudentData_IVM` | Conference list | List conferences |
| `GetConferenceStudentData` | `GetConferenceStudentData_IVM` | Conference detail | Get specific conference |

### Settings & Preferences

| Endpoint | Input | Output | Description |
|----------|-------|--------|-------------|
| `SaveUserSettings` | `UserSetting_IVM` | Success/fail | Save user preferences |
| `GetUserSettings` | `UserSetting_IVM` | Settings | Get user preferences |
| `SaveClassSettings` | `SaveClassSetting_IVM` | Success/fail | Save class settings |
| `GetClassSettings` | `Common_IVM` | Class settings | Get class settings |
| `SaveClassCalendarSettings` | `SaveClassCalendarSettings_IVM` | Success/fail | Save calendar |
| `SaveClassesPreferences` | `SaveClassPreferences_IVM` | Success/fail | Save class display preferences |
| `GetClassesPreferences` | `GetClassesPreferences_IVM` | Preferences | Get class display preferences |

### PKT (Pearson Knowledge Technologies) Scoring

| Endpoint | Input | Output | Description |
|----------|-------|--------|-------------|
| `GetPKTCountSettingFromDistrict` | `Common_IVM` | PKT settings | Get district PKT score limits |
| `SavePKTCountsForAttempt` | `SavePKTCountsForAttempt_IVM` | Success/fail | Save PKT usage counts |
| `GetPKTCountsForAttempt` | `GetPKTCountsUserAttempt_IVM` | PKT counts | Get PKT counts for an attempt |
| `GetScoresForOralFluencySlidesInGradableItem` | `...IVM` | OF scores | Get oral fluency slide scores |
| `SetScoresForOralFluencySlidesInGradableItem` | `...IVM` | Success/fail | Set oral fluency scores |

PKT handles:
- **Paragraph scoring** -- automated scoring of student paragraph responses
- **Summary scoring** -- automated scoring of student summary writing
- **Essay scoring** -- automated essay evaluation
- **Oral fluency scoring** -- speech-to-text evaluation

### Reports & Skills

| Endpoint | Input | Output | Description |
|----------|-------|--------|-------------|
| `GetskillbasedreportdatabyWeekRange` | `Common_IVM` | Skill report | Skill mastery by week range |
| `GetskillbasedreportdatabyDateRange` | `SkillBasedReportByDateRange_IVM` | Skill report | Skill mastery by date range |
| `GetSkillTaxonomyInformation` | `Common_IVM` | Skill taxonomy | Get skill taxonomy structure |
| `GetItemSkillMapping` | `GetItemSkillMapping_IVM` | Skill mappings | Map items to skills |

### Substitute Teacher

| Endpoint | Input | Output | Description |
|----------|-------|--------|-------------|
| `GetStatusOfSubstituteTeacher` | `Common_IVM` | Status | Check substitute teacher status |
| `GetSubstituteTeacherActiveOrInactive` | `Common_IVM` | Active/inactive | Is sub active |

### System / Logging

| Endpoint | Input | Output | Description |
|----------|-------|--------|-------------|
| `SetBulkLog` | `SetBulkLog_IVM` | Success/fail | Batch submit logs (LRS + SYS) |

### EasyBridge (Pending Classes)

| Endpoint | Input | Output | Description |
|----------|-------|--------|-------------|
| `GetPendingClassList` | `GetPendingClassList_IVM` | Pending classes | List EasyBridge pending classes |
| `GetClassInfo` | `GetClassInfo_IVM` | Class info | Get class details |
| `UpdatePendingClassNotification` | `UpdatePendingClassNotification_IVM` | Success/fail | Update pending class |
| `UpdateClassForEasyBridgeLinkedClass` | `UpdateClass_IVM` | Success/fail | Update EB-linked class |

---

## CCA Controller Endpoints

Admin portal (iPortal) endpoints. All prefixed with `iPortal_`. Used for district/school/class/user management. These are NOT used by the student/teacher app.

### Authentication

| Endpoint | Description |
|----------|-------------|
| `iPortal_Login` | Admin portal login |
| `iPortal_Login_For_SAML` | Admin SAML login |
| `iPortal_GetDistrictEBTypeAndSSOLoginURL` | Get SSO URL for district |
| `iPortal_UnlockAdminAccount` | Unlock locked admin account |

### Product Management

| Endpoint | Description |
|----------|-------------|
| `iPortal_Product_CreateOrUpdate` | Create/update product |
| `iPortal_Product_List` | List all products |
| `iPortal_Product_Info` | Get product details |
| `iPortal_Product_Delete` | Delete product |

### Product Grade Management

| Endpoint | Description |
|----------|-------------|
| `iPortal_ProductGrade_CreateOrUpdate` | Create/update product-grade combo |
| `iPortal_ProductGrade_List` | List product grades |
| `iPortal_ProductGrade_Info` | Get product grade details |
| `iPortal_ProductGrade_Info_By_RumbaProductId` | Lookup by Rumba product ID |
| `iPortal_ProductGrade_Delete` | Delete product grade |

### District Management

| Endpoint | Description |
|----------|-------------|
| `iPortal_District_List` | List all districts |
| `iPortal_District_Info` | Get district details |
| `iPortal_District_AddUpdateProducts` | Add/update products for district |
| `iPortal_District_Setting_Reset` | Reset district settings |
| `iPortal_District_SetBTSYear` | Set BTS (Back To School) year |

### School & Grade Management

| Endpoint | Description |
|----------|-------------|
| `iPortal_School_List` | List schools in district |
| `iPortal_Grade_CreateOrUpdate` | Create/update grade |
| `iPortal_Grade_Delete` | Delete grade |
| `iPortal_Grade_List` | List grades |
| `iPortal_Grade_Info` | Get grade details |

### Class Management

| Endpoint | Description |
|----------|-------------|
| `iPortal_Class_CreateOrUpdate` | Create/update class |
| `iPortal_Class_List` | List classes |
| `iPortal_Class_Info` | Get class details |
| `iPortal_Class_StatusUpdate` | Update class status |
| `iPortal_Class_Summary` | Get class summary |
| `iPortal_Class_Delete` | Delete class |
| `iPortal_UpdateEdCloudLinkedClass` | Update EdCloud-linked class |
| `iPortal_CreateClassWithMultipleUsers` | Auto-create class with users |
| `iPortal_CreateMultipleClassesWithOneStudent` | Create multiple demo classes |

### Roster Management

| Endpoint | Description |
|----------|-------------|
| `iPortal_Class_Roster_List` | List students in class |
| `iPortal_Class_Roster_List_CSV` | Export roster as CSV |
| `iPortal_Multiple_Class_Roster_List_CSV` | Multi-class roster CSV |
| `iPortal_Class_Roster_Update` | Update roster entry |
| `iPortal_ClassRoster_MoveUser` | Move student between classes |
| `iPortal_ClassRoster_Disable` | Disable roster entry |
| `iPortal_Remove_ClassRoster` | Remove from roster |
| `iPortal_CheckForMovementOfUsers` | Check if user can be moved |

### User Management

| Endpoint | Description |
|----------|-------------|
| `iPortal_User_CreateOrUpdate` | Create/update user |
| `iPortal_NoniLit_User_CreateOrUpdate` | Create non-iLit user |
| `iPortal_User_List` | List users |
| `iPortal_User_Info` | Get user details |
| `iPortal_AdminUser_List` | List admin users |
| `iPortal_Orphan_User_List` | List unassigned students |
| `iPortal_DisableLogin` | Disable user login |
| `iPortal_DeleteClassviewUser` | Delete user |
| `iPortal_SaveUserSettings` | Save admin user settings |
| `iPortal_GetUserSettings` | Get admin user settings |

### Bulk Operations

| Endpoint | Description |
|----------|-------------|
| `iPortal_UploadBulkUserCSV` | Upload bulk user CSV |
| `iPortal_UploadBulkUserCSV_QuickClass` | Quick class bulk upload |
| `iPortal_CheckBulkUserValidation` | Check bulk upload status |
| `iPortal_CreateSubscribeBulkUsers` | Execute bulk user creation |
| `iPortal_CopyClassData` | Copy class data |
| `iPortal_UploadBulkCopyClassDataCSV` | Bulk copy via CSV |
| `iPortal_UploadBulkUserDeleteCSV` | Bulk delete users CSV |
| `iPortal_UploadBulkInstructorDeleteCSV` | Bulk delete instructors CSV |

### System Config

| Endpoint | Description |
|----------|-------------|
| `iPortal_GetSysConfigList` | List all system configs |
| `iPortal_GetSysConfig` | Get specific config |
| `iPortal_SetSysConfig` | Set config value |
| `iPortal_DeleteSysConfig` | Delete config |

### EasyBridge / EdCloud Integration

| Endpoint | Description |
|----------|-------------|
| `iPortal_GetDistrictSuffixFromEdcloud` | Get district suffix |
| `iPortal_ValidateEdcloudSections` | Validate EdCloud sections |
| `iPortal_CreateEdcloudClasses` | Create classes from EdCloud |
| `iPortal_GetListofEdCloudClasses` | List EdCloud classes |
| `iPortal_FindAndSyncRosterForEdcloudLinkedClasses` | Sync rosters |
| `iPortal_EasbridgeSubPubNotification` | EasyBridge subscription callback |
| `iPortal_DoProcessingOfPendingEasyBridgeSyncingClasses` | Process pending EB classes |
| `iPortal_DeleteNotificationForPendingClassQueue` | Delete EB notification |

### Maintenance & Utilities

| Endpoint | Description |
|----------|-------------|
| `iPortal_ResetClassProgressData` | Reset class progress |
| `iPortal_PurgeAllTokens` | Purge all tokens |
| `iPortal_PurgeClassTokens` | Purge class tokens |
| `iPortal_ResetUserAttemptData` | Reset user attempt data |
| `iPortal_CompareUAICache` | Compare UAI cache |
| `iPortal_ResetRecommendedBooksCache` | Reset book recommendation cache |
| `iPortal_TransferGradeAttemptsBetweenClasses` | Transfer grades between classes |
| `iPortal_DeleteEverythingForDistirct` | Delete all district data (dangerous) |
| `iPortal_Restore_Class_Data` | Restore class data |

### New Year Rollover (NYR)

| Endpoint | Description |
|----------|-------------|
| `iPortal_NYR_MigrateSchoolAndDistrictAdmins` | Migrate admins to new year |
| `iPortal_NYR_MigrateDistricts` | Migrate districts |
| `iPortal_NYR_MigratePearsonRoleUsers` | Migrate Pearson users |
| `iPortal_NYR_GetAllSourceDistricts` | List source districts |
| `iPortal_NYR_GetAllClassesForSourceDistrict` | List classes for migration |
| `iPortal_NYR_MigrateClassesWithAllData` | Full class data migration |
| `iPortal_NYR_PrepareDataForBTS2020InBTS2019DB` | Prepare new year data |

### Digital Library Management

| Endpoint | Description |
|----------|-------------|
| `iPortal_GetHideBook` | Get hidden book status |
| `iPortal_HideBookTitle` | Hide/show a book title |

---

## RPT Controller Endpoints

Reporting and analytics endpoints. All prefixed with `iRPT_`. Used by admin dashboards.

### Data Lists (Filters)

| Endpoint | Description |
|----------|-------------|
| `iRPT_District_List` | List districts for reports |
| `iRPT_School_List` | List schools |
| `iRPT_Product_List` | List products |
| `iRPT_Class_List` | List classes |
| `iRPT_Class_Roster_Details` | Roster details |
| `iRPT_Verb_List` | LRS verb list |
| `iRPT_Caller_App_List` | App types list |
| `iRPT_Grade_List` | Grades list |
| `iRPT_User_List` | Users list |
| `iRPT_Product_Grade_List` | Product-grade combos |

### Reports

| Endpoint | Description |
|----------|-------------|
| `iRPT_DR_Reading_Growth` | Reading growth report |
| `iRPT_DR_Reading_Growth_Export` | Export reading growth CSV |
| `iRPT_Detail_Reading_Growth_Export` | Detailed reading growth CSV |
| `iRPT_DR_GroupWiseSummary` | Reading comprehension summary |
| `iRPT_DR_ReadingCompreDetail` | Reading comprehension detail |
| `iRPT_DR_LA_Summary` | Language arts summary |
| `iRPT_GR_Summary` | Grade reporting summary |
| `iRPT_GR_Summary_Export` | Grade report CSV |
| `iRPT_GR_Detailed_Export` | Detailed grade CSV |
| `iRPT_WC_Summary` | Word count summary |
| `iRPT_StudentSummaryReport` | Student summary (PDF) |
| `iRPT_GradeSummaryReport` | Grade summary (PDF) |
| `iRPT_StudentUsageTimestamp` | Student usage timestamps |
| `iRPT_GradeCompletion_Export` | Grade completion CSV |
| `iRPT_AllStudentProgressSummary` | All student progress |
| `iRPT_BookReviewSummaryForClass` | Book review summary |
| `iRPT_GetInterestInventoryForClass` | Interest inventory for class |
| `iRPT_InterestInventoryAnalysisSummary` | Interest analysis |
| `iRPT_AllDistrict_Stats` | All district statistics |
| `iRPT_DistrictSummary` | District summary |
| `iRPT_SBR_Summary_Export` | Skill-based report CSV |
| `iRPT_SBR_By_Date_Range_Export` | Skill report by date CSV |

### Graphical Reports

| Endpoint | Description |
|----------|-------------|
| `iRPT_GradeAssessement_GraphicalReport` | Grade assessment charts |
| `iRPT_StudentUsage_GraphicalReport` | Student usage charts |
| `iRPT_WordRead_GraphicalReport` | Words read charts |
| `iRPT_ReadingGrowth_GraphicalReport` | Reading growth charts |
| `iRPT_SkillBased_GraphicalReport` | Skill mastery charts |
| `iRPT_StudentAndTeacherUsage_GraphicalReport` | Usage comparison |
| `iRPT_ClassInformation_GraphicalReport` | Class info charts |

### Logs

| Endpoint | Description |
|----------|-------------|
| `iRPT_LRS_Logs` | Learning Record Store logs |
| `iRPT_SYS_Logs` | System logs |
| `iRPT_GetEdcloudSyncLogs` | EdCloud sync logs |

### CSV Exports

| Endpoint | Description |
|----------|-------------|
| `iRPT_StudentUsageReportAsCSV` | Student usage CSV |
| `iRPT_Admin_List_CSV_Format` | Admin list CSV |
| `iRPT_GradeUsageReportAsCSV` | Grade usage CSV |
| `iRPT_PKTCountReportAsCSV` | PKT count CSV |
| `iRPT_ClassUsageProgressAsCSV` | Class usage CSV |
| `iRPT_ActivityReportExportAsCSV` | Activity report CSV |
| `iRPT_AssignmentExportReport` | Assignment export CSV |
| `iRPT_EllevationGradeExportAsCSV` | Ellevation grade CSV |
| `iRPT_NYRAnalysisReportAsCSV` | NYR analysis CSV |
| `iRPT_ClassEndDatesDumpReportAsCSV` | Class end dates CSV |
| `iRPT_AllDistrict_Stats_CSV_Export` | All districts CSV |

---

## DynamoDB Table Schemas

28 tables total. Key schema details below.

### Core Entity Tables

#### USER

| Column | Code | Description |
|--------|------|-------------|
| UID | Hash Key | User ID |
| SCHID | | School ID |
| DISID | | District ID |
| ENC_UN | | Encrypted Username |
| ENC_P | | Encrypted Password |
| UROLE | | User Role (enum) |
| ENC_UFN | | Encrypted Full Name |
| STID | | Student ID (external) |
| RUID | | Rumba User ID |
| IUO | | Is User Online |
| ATID | | Authentication Token ID |

#### CLASS

| Column | Code | Description |
|--------|------|-------------|
| CID | Hash Key | Class ID |
| DISID | | District ID |
| SCHID | | School ID |
| PGID | | Product Grade ID |
| CN | | Class Name |
| CLID | | Class Listing ID |
| STA | | Status (enum) |
| TID | | Teacher ID |
| CLUN | | Current Lesson Unit Number |
| CLWN | | Current Lesson Week Number |
| CLDN | | Current Lesson Day Number |
| CRN | | Class Revision Number |
| ASM | | Assignment Sending Mode |
| CW | | Current Week |

#### CLASS_ROSTER

| Column | Code | Description |
|--------|------|-------------|
| CID | Hash Key | Class ID |
| UID | Range Key | User ID |
| URIC | | User Role In Class |
| UCRL | | User Current Reading Level |
| UCLL | | User Current Lexile Level |
| UCRBID | | User Current Reading Book ID |
| ACT | | Active (Y/N) |
| TBC | | Total Books Completed |

#### DISTRICT

| Column | Code | Description |
|--------|------|-------------|
| DISID | Hash Key | District ID |
| DN | | District Name |
| DT | | District Type |
| PIDS | | Product IDs |

#### SCHOOL

| Column | Code | Description |
|--------|------|-------------|
| SCHID | Hash Key | School ID |
| DISID | Range Key | District ID |
| SN | | School Name |

### Content/Curriculum Tables

#### PRODUCT_GRADE

| Column | Code | Description |
|--------|------|-------------|
| PGID | Hash Key | Product Grade ID |
| PID | | Product ID |
| GID | | Grade ID |
| GC | | Grade Code (e.g., "g6") |
| TU | | Total Units |
| TWG | | Total Weeks Within Grade |
| TLG | | Total Lessons Within Grade |
| GIPD | | Grade Items Info Path Detail (JSON with CDN URLs) |

#### PRODUCT_GRADE_ITEM

| Column | Code | Description |
|--------|------|-------------|
| IID | Hash Key | Item ID |
| PGID | Range Key | Product Grade ID |
| CIID | | CMS Item ID |
| IT | | Item Type (1=assessment, 2=assignment, 3=ebook, 4=lesson) |
| IST | | Item Sub Type (see enum) |
| UNUM | | Unit Number |
| WNUM | | Week Number |
| DNUM | | Day Number |
| IG | | Is Gradeable |
| IDN | | Item Display Name |
| MS | | Max Score |
| IL | | Item Lexile Level |
| IC | | Item Category |
| IWC | | Item Word Count |
| IPC | | Item Page Count |

### Student Progress Tables

#### USER_ATTEMPT_ITEM

| Column | Code | Description |
|--------|------|-------------|
| CID | Hash Key | Class ID |
| IAID | Range Key | Item Attempt ID |
| UID | | User ID |
| IID | | Item ID |
| IT | | Item Type |
| IUT | | Item Sub Type |
| ST | | Status (0=deleted, 1=assigned, 2=in_progress, 3=completed, 4=scored) |
| RC | | Revision Count |
| ARID | | Attempt Revision ID |
| SCORE | | Score details (JSON) |
| GRADE_SCORE | | Final grade score |
| UAI_QR | | Question results (JSON) |
| IP_DET | | Item Progress Details (JSON) |

Score details (SCORE) JSON structure:
```typescript
interface UAIScoreDetails {
  SS: number;    // System Score
  IS: number;    // Instructor Score
  FS: number;    // Final Score
  MS: number;    // Max Score
  WC: number;    // Word Count
  RS: number;    // Reading Score
  RMS: number;   // Reading Max Score
  RSIP: number;  // Reading Score In Progress
  IWTRCP: number; // IWT Read Checkpoint Score
  IWTSC: number;  // IWT Summary Score
  SPPTS: number;  // Study Plan Points
  SPPRTS: number; // Study Plan Practice Points
}
```

#### USER_ATTEMPT_LIBRARY

| Column | Code | Description |
|--------|------|-------------|
| CID | Hash Key | Class ID + User ID (composite) |
| UALID | Range Key | User Attempt Library ID |
| UID | | User ID |
| IID | | Item ID (Book ID) |
| PDS | | Progress Data Summary (JSON) |
| PDD | | Progress Data Details (JSON) |
| TNWR | | Total Number of Words Read |
| TNPR | | Total Number of Pages Read |
| TNSS | | Total Number of Seconds Spent |

#### NOTE

| Column | Code | Description |
|--------|------|-------------|
| NID | Hash Key | Note ID |
| UID | | User ID |
| CID | | Class ID |
| NT | | Note Type (1=journal, 2=wordbank, 3=classnotes) |
| NTITLE | | Note Title |
| NTEXT | | Note Text |
| NRIID | | Note Reference Item ID |
| SNT | | Short Note Text |
| NC | | Note Comment (teacher) |
| RUNUM | | Reference Unit Number |
| NRID | | Note Revision ID |

### Communication Tables

#### CLASS_COMM

| Column | Code | Description |
|--------|------|-------------|
| CID | Hash Key | Class ID |
| MID | Range Key | Message ID |
| Content | | Message content |

#### CLASS_COMM_SCRIBBLE

| Column | Code | Description |
|--------|------|-------------|
| CID | Hash Key | Class ID |
| SID | Range Key | Scribble ID |
| Content | | Scribble JSON data |

#### CLASS_BUZZ

| Column | Code | Description |
|--------|------|-------------|
| CID | Hash Key | Class ID |
| BID | Range Key | Buzz ID |
| Content | | Buzz comment data |

#### CLASS_POLL

| Column | Code | Description |
|--------|------|-------------|
| CID | Hash Key | Class ID |
| PID | Range Key | Poll ID |
| Content | | Poll data |

### Caching Tables

| Table | Hash Key | Range Key | Description |
|-------|----------|-----------|-------------|
| DB_CACHE_GEN | CacheID | | General cache |
| DB_CACHE_NOTE | NoteCacheID | | Note cache (per user+class+type) |
| DB_CACHE_PGI | PGID | | Product Grade Item cache |
| DB_CACHE_UAI | CacheID | | User Attempt Item cache |

### System Tables

| Table | Hash Key | Description |
|-------|----------|-------------|
| SYSTEM_TOKEN | TokenID | Active session tokens |
| SYSTEM_PERFORMANCE_LOG | LogID | System performance logs |
| LEARNER_RECORD_STORE | LogID | Learning analytics (xAPI-style) |
| TEMP_DATA | TempID | Temporary processing data |
| APP_TAXANOMY | TaxonomyID | Skill taxonomy definitions |

### Integration Tables

| Table | Hash Key | Description |
|-------|----------|-------------|
| EASYBRIDGE_CLASS_PENDING_QUEUE | SectionID | Pending EB class sync queue |
| EASYBRIDGE_CLASS_NOTIFICATION_LOGS | NotificationID | EB notification audit log |
| EDCLOUD_ROSTER_SYNC_LOGS | LogID | EdCloud roster sync logs |

### Conferencing Table

#### USER_CONFERENCING

| Column | Code | Description |
|--------|------|-------------|
| CID | Hash Key | Class ID |
| UCID | Range Key | User Conference ID |
| UID | | User ID (student) |
| IUID | | Instructor User ID |
| Content | | Conference notes data |

### CLASSVIEW_USER (Separate from USER)

| Column | Code | Description |
|--------|------|-------------|
| CVUID | Hash Key | ClassView User ID |
| UID | | User ID |
| Content | | User profile/settings data |

---

## Key Enumerations

### UserRole

| Value | Code | Description |
|-------|------|-------------|
| 1 | SA | Super Admin |
| 2 | A | Admin |
| 3 | I | Teacher (Instructor) |
| 4 | S | Student |
| 5 | PA | Pearson Admin |
| 6 | PU | Pearson User |
| 7 | DA | District Admin |
| 8 | SCA | School Admin |
| 9 | AT | Assistant Teacher |
| 11 | PRU | Parent User |
| 12 | PSC | Pearson Services |
| 13 | CVM | ClassView Manager |
| 14 | CT | Co-Teacher |
| 15 | ST | Substitute Teacher |

### EnumClassStatus

| Value | Status |
|-------|--------|
| 1 | Planned |
| 2 | Active |
| 3 | Inactive |
| 4 | Delete |
| 5 | Pending |
| 6 | Expired |

### ItemType

| Value | Type |
|-------|------|
| 1 | assessment |
| 2 | assignment |
| 3 | ebook |
| 4 | lesson |

### ItemSubType

| Value | Type | Description |
|-------|------|-------------|
| 1 | unitbenchmark | Unit benchmark assessment |
| 2 | day | Daily lesson content |
| 3 | dailyassignment | Daily assignment |
| 4 | iwt | Interactive Writing Tool |
| 5 | word_slam | Word Slam vocabulary game |
| 6 | paragraph | Paragraph writing |
| 7 | epub | eBook (ePub format) |
| 8 | pdf | PDF document |
| 9 | studyplan | Study plan |
| 10 | essay | Essay writing |
| 11 | pluralnouns | Plural nouns word study |
| 12 | digraphs | Digraphs word study |
| 13 | word_families | Word families |
| 14 | syllables | Syllables word study |
| 15 | word_sort | Word sort activity |
| 16 | rotatinglists | Rotating lists |
| 17 | phonictextbasedslide | Phonic text-based slide |
| 18 | wrc | Weekly Reading Check |
| 19 | grade | Grade assessment |
| 20 | frs | Fluency Reading Score |
| 21 | extendedphonic | Extended phonics |
| 22 | nsa | NSA assessment |
| 23 | sl | SL (supplemental lesson) |
| 24 | interactive_sort | Interactive sort activity |

### UserAttemptItemStatus

| Value | Status |
|-------|--------|
| 0 | deleted |
| 1 | assigned |
| 2 | in_progress |
| 3 | completed |
| 4 | scored |

### NoteType

| Value | Type |
|-------|------|
| 1 | journal |
| 2 | wordbank |
| 3 | classnotes |

### HighlightType

| Value | Type |
|-------|------|
| 1 | book |
| 2 | assessment |

### SessionStatus

| Value | Status |
|-------|--------|
| 1 | Start |
| 2 | Stop |

### BookTypeLibraryProgress

| Value | Type | Description |
|-------|------|-------------|
| 1 | TTR | Take Turn Reading (independent) |
| 2 | RATA | Read Aloud / Think Aloud (teacher-led) |

### StudentEnrollmentModel

| Value | Model |
|-------|-------|
| 1 | Manual |
| 2 | Auto |
| 3 | EasyBridge |

### ProjectionItemType

| Value | Type |
|-------|------|
| 1 | Image |
| 2 | Video |
| 3 | Question |
| 4 | TextNAudio |
| 5 | AdHocPoll |
| 6 | Buzz |
| 7 | AssignmentOrAssessment |

### AppType

| Value | Type |
|-------|------|
| 0 | all |
| 1 | ios |
| 2 | andrd (Android) |
| 3 | wintab (Windows Tablet) |
| 4 | webclient |
| 5 | websrv |
| 6 | network |
| 7 | chromeapp |

---

## Data Flow Diagrams

### Student Login Flow

```
1. Client -> GetServiceTokenID -> TokenID
2. Client -> ValidateLoginForStudent(UserName, Password, TokenID)
   <- { UserID, UserRole, ClassInfo[{ ClassID, ProductGradeID, ClassName, ... }] }
3. Client -> GetGradeInfoInDetail(ProductGradeID)
   <- { ContentBaseURL, JsonZipURL, LibraryJsonZipURL, ... }
4. Client downloads content ZIPs from CDN
5. Client -> GetTOCItems(ProductGradeID)
   <- [{ ItemID, CMSItemID }]  // Maps DB IDs to content file paths
6. Client -> GetClassStatus(ClassID)
   <- { Started: "Y/N", CurrentAction, ClassCurrentActivities }
7. Client -> GetGradebookForStudent(MaxAttemptRevisionID: 0)
   <- { GradeBookData[{ SID, IID, IAID, ARID }], MaxRevisionNumber }
8. Client -> GetLibraryProgressSummary()
   <- { TotalNumberOfWordsRead, TotalBooksCompleted, BookItemIDs[], ... }
```

### Reading a Book Flow

```
1. Student selects book from library
2. Client -> SetCurrentBookForStudent(ItemID)
3. Client -> GetLibraryProgress(ItemID)
   <- { ProgressDataDetails: { chapNo, sentNo, "font-size" }, ... }
4. Client loads book content from CDN using CMSItemID
5. Client navigates to saved chapter/sentence position
6. Periodically: Client -> SaveLibraryProgress(
     ProgressDataSummary: { bookCompleted: false },
     ProgressDataDetails: { chapNo, sentNo, "font-size" },
     TotalNumberOfWordsRead, TotalNumberOfSecondsSpent, BookLexileLevel
   )
7. When book completed: SaveLibraryProgress with bookCompleted: true
8. Client -> GetHighLightInfo(ProductGradeHighlightReferenceID)
   <- { HighlightJsonData: [{ paragraphindex, wordindex, sentenceindex, color }] }
```

### Assignment Completion Flow

```
1. Client -> GetGradebookForStudent()
   <- List of assigned items with status
2. Client loads assignment content from CDN using CMSItemID
3. Student works through assignment
4. Client -> SaveAttemptDataForGradeableItem(
     ItemID, StudentAttemptData: "<JSON blob>",
     SystemScore, Status: 2 (in_progress), IAID: "" (first attempt)
   )
   <- { IAID } // Item Attempt ID for subsequent saves
5. Student completes:
   Client -> SaveAttemptDataForGradeableItem(
     Status: 3 (completed), IAID, FinalScore, ...
   )
6. Teacher scores (if applicable):
   Client -> SetScoreForGradeableItem(IAID, Score)
7. Student reviews:
   Client -> GetAttemptDataForGradeableItem(IAID)
   <- { StudentAttemptData, FinalScore, Comment, SFB }
```

### Teacher Session Flow

```
1. Teacher -> SetSession(SessionState: 1 [Start], GroupID)
2. Teacher -> SetCurrentLessonForClass(Unit, Week, Day)
3. Teacher -> SetProjection(Image/Video/Question/eBook to project)
4. Students poll -> GetClassStatus() every few seconds
   <- { Started: "Y", CurrentAction: "B", CurrentActionData: {...} }
5. Teacher -> SetBroadcast(content to push to students)
6. Teacher -> SetBuzzComment() / UpdatePoll()
7. Teacher -> SetSession(SessionState: 2 [Stop])
```

### Incremental Sync Pattern

Many endpoints support incremental sync to minimize data transfer:

```
// First call: full sync
Client -> GetGradebookForStudent(MaxAttemptRevisionID: 0)
  <- { GradeBookData: [...all items...], MaxRevisionNumber: "12345" }

// Subsequent calls: only changes since last sync
Client -> GetGradebookForStudent(MaxAttemptRevisionID: 12345)
  <- { GradeBookData: [...only changed items...], MaxRevisionNumber: "12350" }
```

This pattern is used by: `GetGradebookForStudent`, `GetNotelist`, `GetGradebookForInstructor`, and other list endpoints.

---

## Notes for Frontend Replica Builders

### What you need from the API

For a student-facing replica, the critical data shapes are:

1. **Login** -- to get `ClassInfo[]` with `ProductGradeID` and `ClassID`
2. **Grade info** -- to get CDN URLs for content
3. **TOC** -- to map item IDs to content files
4. **Library progress** -- reading position and stats
5. **Gradebook** -- assignment status and scores
6. **Notes** -- journal, word bank, class notes
7. **Class status** -- whether session is active
8. **User level** -- Lexile and reading levels
9. **Highlights** -- book and assessment annotations
10. **Interest inventory** -- student survey data

### What you can mock

- All authentication (use static tokens)
- CDN content delivery (serve content locally)
- PKT scoring (return mock scores)
- Real-time features (projection, broadcast, buzz, polls)
- EasyBridge/EdCloud integration
- Admin portal (iPortal) entirely
- Reporting (iRPT) entirely
- Conferencing (use static data)

### Abbreviations used in DynamoDB columns

| Short | Full |
|-------|------|
| CID | Class ID |
| UID | User ID |
| IID | Item ID |
| IAID | Item Attempt ID |
| ARID | Attempt Revision ID |
| PGID | Product Grade ID |
| DISID | District ID |
| SCHID | School ID |
| CIID | CMS Item ID |
| IT | Item Type |
| IST | Item Sub Type |
| ST | Status |
| UNUM | Unit Number |
| WNUM | Week Number |
| DNUM | Day Number |
| SS | System Score |
| FS | Final Score |
| MS | Max Score |
| NT | Note Type |
| NRID | Note Revision ID |
| PDS | Progress Data Summary |
| PDD | Progress Data Details |
| TNWR | Total Number of Words Read |
| TNPR | Total Number of Pages Read |
| TNSS | Total Number of Seconds Spent |
| UCRL | User Current Reading Level |
| UCLL | User Current Lexile Level |
