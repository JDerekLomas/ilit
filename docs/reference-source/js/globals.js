// JavaScript

window.$GLOBALS = new (function () {
	var GLOBALS = {};
	
	this.get = function (psVarName) {
		this.set(psVarName);
		
		return GLOBALS[psVarName];
	};
	
	this.set = function (psVarName, pMixValue) {
		if (typeof GLOBALS[psVarName] == 'undefined') {
			GLOBALS[psVarName] = pMixValue;
		}
		
		return GLOBALS[psVarName];
	};
	
	this.unset = function (psVarName) {
		if (typeof GLOBALS[psVarName] != 'undefined') {
			delete GLOBALS[psVarName];
		}
	};
})();