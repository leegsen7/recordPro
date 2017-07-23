import moment from '../../../utils/moment';
import {eF,myToast} from "../../../utils/util";
import onfire from "../../../utils/onfire";

let app = getApp(),
	wageArr = ["wage","payIncentives","payFinal","subsidy","providentFund","fiveInsure","deduction","des"];

Page({
	data:{
		toMonth: moment().format("YYYY-MM"),
		inputArr:[{
			text:'月工资',
			data:'',
		},{
			text:'绩效奖金',
			data:''
		},{
			text:'年终奖金',
			data:''
		},{
			text:'补贴',
			data:''
		},{
			text:'公积金',
			data:''
		},{
			text:'五险',
			data:''
		},{
			text:'扣款',
			data:''
		},{
			text:'备注信息',
			data:''
		}],
	},
	bindDateChange: function(e){
		this.setData({
			toMonth: e.detail.value
		})
	},
	focusEvent: function(e){
		e = eF(e);
		this.setData({
			focusIndex: e.index
		})
	},
	blurEvent: function(e){
		e = eF(e);
	},
	inputEvent: function(e){
		let o = eF(e);
		let [index,value] = [o.index,e.detail.value];
		this.data.inputArr[index].data = value;
		this.setData({
			'inputArr': this.data.inputArr
		})
	},
	confirmEvent: function(){
		let inputArr = this.data.inputArr,
			len = inputArr.length-1;
		if (!inputArr[0].data){
			myToast('请填写该月工资');
			return false;
		}
		let obj = {};
		obj.toMonth = this.data.toMonth;
		inputArr.forEach((val,index) => {
			obj[wageArr[index]] = index==len ? val.data : (val.data*1 || 0);
		});
		obj.acWage = obj.wage+obj.payIncentives+obj.payFinal+obj.subsidy-obj.providentFund-obj.fiveInsure-obj.deduction;
		if (this.checkIn(obj.toMonth)){
			onfire.fire('postWage',obj);
			wx.navigateBack();
		}
		else {
			myToast('该月份已经在工资单上了');
		}
	},
	// 检查输入是否合法
	checkIn: function(month){
		if (this.data.isEdit) return true;
		let year = month.substr(0,4);
		let wageObj = this.data.wageObj;
		if (!wageObj) return true;
		let yearObj = wageObj[year];
		if (!yearObj) return true;
		return yearObj.every(val => {
			return val.toMonth !==month;
		})
	},
	onLoad: function(ops){
		let wageObj = app.data.wageObj;
		this.setData({
			wageObj: wageObj
		})
		if (ops){
			this.setData({
				isEdit: ops.edit || false
			})
		}
	}
})