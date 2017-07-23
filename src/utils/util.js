function eF(e){
	return e.currentTarget.dataset;
}
function myToast(title,time=1000,mask=true){
	wx.showToast({
		title: title,
		image: "/images/gantan.png",
		duration: time,
		mask: mask
	})
}
module.exports = {
	eF: eF,
	myToast: myToast
}
