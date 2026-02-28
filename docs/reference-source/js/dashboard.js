// JavaScript

function Dashboard (poConfig) {
	PageTemplate.call(this, poConfig);
};
Dashboard.prototype = Object.create(PageTemplate.prototype);
Dashboard.prototype.render = function () {
	this.getContainer().html(
		_.template(
			this.getMainTemplate().html(),
			{
				'imgSrc':	'media/' + this.getDemoImageName(),
				'module':	this.getModuleName()
			}
		)
	);
};
Dashboard.prototype.resize = function () {
	var oSelf = this,
		oContainer = this.getContainer(),
		dHeight = (this.getWindowHeight() - 25);
	
	oContainer.css({
		'max-height':	dHeight + 'px',
		'overflow':		'auto',
		'text-align':	'center'
	});
	
	$('#dashboard_2').css('max-height', (dHeight - 5) + 'px');
};
