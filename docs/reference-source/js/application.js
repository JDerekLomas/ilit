/* 
 * iLite Main JS
 */
function Application() {
}

/* Properties */
Application.viewType = null;
Application.view = null;
Application.model = null;
Application.currentStage = null;
Application.mainContainer = null;

/* Init Function */
Application.init = function(type) {

    Application.viewType = type;
    //Get Model
    //Application.model = API Call
    Application.getModel();

    switch (Application.viewType) {
        /* case VIEWTYPE.c_s_PLANNER_WEEK:
            Application.view = PlannerWeekView;
            break;            
        case VIEWTYPE.c_s_PLANNER_UNIT:
            Application.view = PlannerUnitView;
            break; */
		case VIEWTYPE.c_s_PLANNER_YEAR:
            Application.view = PlannerYearView;
            break;	
        case VIEWTYPE.c_s_ASSIGNMENT_TOC:
            Application.view = AssignmentsTOCView;
            break;
        case VIEWTYPE.c_s_ASSIGNMENT_SLIDES:
            Application.view = AssigmentSlides;
            break;
        case VIEWTYPE.c_s_LESSON:
            Application.view = LessonView;
            break;
		case VIEWTYPE.c_s_CONNECT:
            Application.view = ConnectView;
            break;
		case VIEWTYPE.c_s_STUDENT_CONNECT:
            Application.view = StudentConnectView;
            break;
        case VIEWTYPE.c_s_LIBRARYHEADER:
            Application.view = LibraryHeaderView;
            break;
        case VIEWTYPE.c_s_CAROUSEL:
            Application.view = LibraryCarouselView;
            break;
        case VIEWTYPE.c_s_LISTVIEW:
            Application.view = LibraryListView;
            break;
        case VIEWTYPE.c_s_BOOKPOPUPVIEW:
            Application.view = LibraryPopupView;
            break;
        case VIEWTYPE.c_s_ASSIGNMENT_INSTRUCTOR:
            Application.view = AssignmentContainerView;
            break;
		case VIEWTYPE.c_s_INSTRUCTOR_MESSAGE:
            Application.view = InstructorMessageView;
            break;
		case VIEWTYPE.c_s_NOTEBOOK:
            Application.view = NotebookView;
            break;
		case VIEWTYPE.c_s_NOTEBOOK_TABS: 
            Application.view = NotebookTabsView;
            break;
		case VIEWTYPE.c_s_PERFORMANCE: 
            Application.view = PerformanceView;
            break;
		case VIEWTYPE.c_s_CLASSROOM_CONFERENCE: 
            Application.view = LessonConferenceView;
            break;
		case VIEWTYPE.c_s_SMALLGROUP_CONFERENCE: 
            Application.view = LessonConferenceView;
            break;			
        default:
            Message.write("Please Provide Correct View Type", Message.c_s_MESSAGE_TYPE_CONSOLE);
    }

    Application.callView(Application.stageItem.get(Application.viewType));
}

Application.callView = function(idx) {
    var curIndex = 0;
    var model;
    if (idx != null)
        curIndex = idx;    
    switch (Application.viewType) {
		case VIEWTYPE.c_s_PLANNER_YEAR:
            model = {
				"plannerData":objPlannerJsonData.content.unitsets.units,
				"assessmentData":objPlannerJsonData.content.gradeAssessmentItems,
				"currentVersion": (objPlannerJsonData.currentVersion) ? objPlannerJsonData.currentVersion : "",
				"appPlatform": (objPlannerJsonData.appPlatform) ? objPlannerJsonData.appPlatform : "",
				"messageData":(objMessageJsonData) ? objMessageJsonData.Content : {},
				"unitNumber":objPlannerJsonData.unitNumber,
                "weekNumber":objPlannerJsonData.weekNumber,
                "dayNumber":objPlannerJsonData.dayNumber,
				"itemID":objPlannerJsonData.itemID,
				"gradeItemsData":objGradeItemsData,
				"userRoleInClass":objPlannerJsonData.userRoleInClass
			};
            break;
        case VIEWTYPE.c_s_ASSIGNMENT_TOC:
            model = objAssignmentTOCJsonData.Content;
            break;
        case VIEWTYPE.c_s_ASSIGNMENT_SLIDES:
            model = objAssignmentSlidesJsonData;
            break;
        case VIEWTYPE.c_s_LIBRARYHEADER:
            model = LibraryCarouselView.model;
            Application.mainContainer = $("#" + LIBRARY.c_s_HEADER_CONTAINER);
            break;
        case VIEWTYPE.c_s_CAROUSEL:
            Application.mainContainer = $("#" + LIBRARY.c_s_MAIN_CONTAINER);
            break;
        case VIEWTYPE.c_s_LISTVIEW:
            Application.mainContainer = $("#" + LIBRARY.c_s_MAIN_CONTAINER);
            break;
        case VIEWTYPE.c_s_BOOKPOPUPVIEW:
            Application.mainContainer = $("#" + LIBRARY.c_s_BOOK_POPUP_CONTAINER);
            break;
        case LESSON.c_s_LESSON:
            Application.mainContainer = $("#" + LESSON.c_s_MAIN_CONTAINER);
            model = {
				"LessonData"  : objLessonJsonData.content || objLessonData, //ILIT-5929
				"LibraryData" : objBookList
			};
            break;
		case VIEWTYPE.c_s_CONNECT:
            Application.mainContainer = $("#" + CONNECT.c_s_MAIN_CONTAINER);
            model = {
				"ConnectData"  : objConnectData,						
			};
            break; 
		case VIEWTYPE.c_s_STUDENT_CONNECT:
            Application.mainContainer = $("#" + STUDENT_CONNECT.c_s_MAIN_CONTAINER);
            model = {
					"studentBuzzData" : objBuzzListData.Content,
					"buzzNotes" : objBuzzCommentData
			};
            break;		
        case VIEWTYPE.c_s_ASSIGNMENT_INSTRUCTOR:            
            model = {
                        "AssignmentData" : objAssignmentListJsonData.Content, 
                        "StudentList" : objStudentListJsonData.Content,            
                        "GradeData" :(objGradeBookJsonData == null) ? null: objGradeBookJsonData.Content
                    };
            break;
		case VIEWTYPE.c_s_INSTRUCTOR_MESSAGE:
            model = objMessageJsonData.Content;
            break;
		case VIEWTYPE.c_s_NOTEBOOK:
			model = {};
            break;
		case VIEWTYPE.c_s_NOTEBOOK_TABS:
			model = (objNoteBookData.Content || {}).Data || [];
            break;
		case VIEWTYPE.c_s_PERFORMANCE: 
			model = {
				"unitDetails" : objPerformanceInfoJsonData,
				"performanceInfoData" : objPerformanceInfoData,
				"studentListData" : objStudentListJsonData.Content,
				"assignmentListData" : objAssignmentListJsonData.Content,
				"gradeBookData" :(objGradeBookJsonData == 0) ? 0 : objGradeBookJsonData.Content,
				"classLibraryProgressData" :(objLibraryProgressDetailForClass == 0) ? 0 : objLibraryProgressDetailForClass.Content,
				"skillTaxonomyInfo" :(objSkillTaxonomyInformation == 0) ? 0 : objSkillTaxonomyInformation.Content,
				"skillBasedReportDataByWeekRange" :(objSkillBasedReportDataByWeekRange == 0) ? 0 : objSkillBasedReportDataByWeekRange.Content,
				"classUserLevelDetails" :(objGetClassUserLevel == 0) ? 0 : objGetClassUserLevel.Content
			};
            break;
		case VIEWTYPE.c_s_CLASSROOM_CONFERENCE:
			if(oPlatform.isDevice()){
				model = {
					"conferencedetails" : objLessonConferenceData,
					"conferenceStudentData" : parent.objconferenceStudentData,
					"libraryProgressData"   : parent.objLibraryProgressSummary,
					"libraryData"           : objBookList,
					"conferenceListStudentData" : parent.objconferenceListStudentData,
					"conferencedItemId"		: parent.objconferenceStudentData.Content.ItemID
				};
			}
			else{
				model = {
					"conferencedetails" : objLessonConferenceData,
					"conferenceStudentData" : objconferenceStudentData,
					"libraryProgressData"   : objLibraryProgressSummary,
					"libraryData"           : objBookList,
					"conferenceListStudentData" : objconferenceListStudentData,
					"conferencedItemId"		: objconferenceStudentData.Content.ItemID
				};
			}
            break;
		case VIEWTYPE.c_s_SMALLGROUP_CONFERENCE:
			if(oPlatform.isDevice()){
				model = {
					"conferencedetails" : objLessonConferenceData,
					"assignmentListData" : parent.parent.objAssignmentListJsonData.Content,
					"gradeBookData" :(parent.objGradeBookJsonData == 0) ? 0: parent.objGradeBookJsonData.Content,
					"conferenceStudentData" : parent.objconferenceStudentData,
					"conferencedItemId"		: parent.objconferenceStudentData.Content.ItemID
				};
			}
			else{
				model = {
					"conferencedetails" : objLessonConferenceData,
					"assignmentListData" :objAssignmentListJsonData.Content,
					"gradeBookData" :(objGradeBookJsonData == 0) ? 0: objGradeBookJsonData.Content,
					"conferenceStudentData" : objconferenceStudentData,
					"conferencedItemId"		: objconferenceStudentData.Content.ItemID
				};
			}
            break;
			
        default:
            Message.write("CALLVIEW: Please Provide Correct View Type", Message.c_s_MESSAGE_TYPE_CONSOLE);
            break;
    }
    Application.stageItem.set(Application.viewType, curIndex);
	if (Application.view != null){
        if (typeof LibraryCarouselView != "undefined" && Application.view === LibraryCarouselView) {
			Application.view.preInit(model);
		}
		Application.view.init(model);
    }
	Application.setDefaults();
        
};

Application.viewTypeValue = {
    set: function(value){
        Application.viewType = value;
    },
    get: function(){
        return Application.viewType == null ? "" : Application.viewType;
    }
}

Application.setDefaults = function(){
    
};


// stageItem 
Application.stageItem = {
    set: function(name, value) {
        if (Application.currentStage == null)
            Application.currentStage = {};
        Application.currentStage[name] = value;
    },
    get: function(name) {
        return (Application.currentStage == null || Application.currentStage[name] == null) ? 0 : parseInt(Application.currentStage[name]);
    }
};

// store data
Application.getModel = function() {
    if(typeof jsonData != "undefined"){
		Application.model = jsonData;
	}else{
		Application.model = "";
	}
};
