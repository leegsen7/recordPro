
App({
    onLaunch: function() {
    	let dataObj = wx.getStorageSync('wageObj');
    	if (dataObj){
    		this.data.wageObj = dataObj
    	}
    },
    data: {
    	wageObj: {}
    }
})
