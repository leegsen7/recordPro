var wxCharts = require('../../utils/wxcharts');
// import moment from '../../utils/moment';
import onfire from "../../utils/onfire";

var app = getApp();
var lineChart = null;

Page({
    data: {
        yearArr: [],
        activeYear: '',
        yearObj: [],
    },
    selectEvent: function(e){
        let selevtYear = this.data.yearArr[e.detail.value];
        if (selevtYear != this.data.activeYear){
            this.setData({
                activeYear: selevtYear
            });
            this.upDateDraw(this.getDrawObj(app.data.wageObj,selevtYear));
        }
    },
    touchHandler: function (e) {
        console.log(lineChart.getCurrentDataIndex(e));
        lineChart.showToolTip(e, {
            // background: '#7cb5ec'
        });
    },
    editEvent: function(){
        wx.navigateTo({
            url: './edit/edit'
        })
    },
    drawEvent: function(obj){
        lineChart = new wxCharts({
            canvasId: 'lineCanvas',
            type: 'line',
            categories: obj.categories,
            animation: true,
            background: '#f5f5f5',
            series: [{
                name: `月收入`,
                data: obj.series,
                format: function (val, name) {
                    return val.toFixed(2) + '元';
                }
            }],
            xAxis: {
                disableGrid: true
            },
            yAxis: {
                title: '月收入/元',
                min: 0,
                max: (obj.series.length == 1 && !obj.series[0] ? 100 : undefined)
            },
            width: obj.windowWidth,
            height: 300,
            legend: false,
            legendTextColor: '#7cb5ec',
            dataLabel: false,
            dataPointShape: true,
            extra: {
                ringWidth: '2px'
            }
        });
    },
    upDateDraw: function(obj){
        lineChart.updateData({
            categories: obj.categories,
            series: [{
                name: `月收入`,
                data: obj.series,
                format: function (val, name) {
                    return val.toFixed(2) + '元';
                }
            }]
        })
    },
    getDrawObj: function(wageObj,year){
        let yearObj = null,arr1 = [],arr2 = [];
        if (year){
            yearObj = wageObj[year];
        }
        else {
            let yearArr = Object.keys(wageObj);
            yearArr.sort((a,b) => {
                return b - a;
            })
            this.setData({
                yearArr: yearArr,
                activeYear: yearArr[0]
            })
            yearObj = wageObj[Math.max.apply(null,yearArr)];
        }

        yearObj.forEach(val => {
            arr1.push(val.toMonth);
            arr2.push(val.wage);
        });

        return {
            categories: arr1,
            series: arr2
        };
    },
    fireEvent: function(){
        onfire.on('postWage',data => {
            let wageObj = app.data.wageObj;

            // 首次添加
            if (!lineChart){
                this.drawEvent({
                    categories: [data.toMonth],
                    series: [data.wage]
                });
                wageObj[data.toMonth.substr(0,4)] = [data];
            }
            // 非首次添加
            else{
                let dateArr = data.toMonth.split('-'),
                    [year,month] = [dateArr[0],dateArr[1]];
                // 如果添加的年份已经有了
                let yearObj = wageObj[year];
                if (yearObj){
                    yearObj.push(data);
                    yearObj.sort((a,b) => {
                        return new Date(a.toMonth).getTime() - new Date(b.toMonth).getTime();
                    });
                }
                // 如果没有，更新年份
                else {
                    yearObj = [data];
                    let yearArr = this.date.yearArr;
                    yearArr.push(year);
                    yearArr.sort((a,b) => {
                        return b - a;
                    });
                    this.setData({
                        yearArr: yearArr
                    })
                }
                wageObj[year] = yearObj;

                // 如果添加的年份是当前显示的年份则更新图表
                if (year == this.data.activeYear){
                    this.upDateDraw(this.getDrawObj(wageObj,year));
                }
            }

            wx.setStorageSync("wageObj",wageObj);
            app.data.wageObj = wageObj;
        });
    },
    onLoad: function (e) {
        let wageObj = app.data.wageObj,
            obj = {
                windowWidth: wx.getSystemInfoSync().windowWidth
            };

        if (wageObj && JSON.stringify(wageObj) != '{}'){
            let assignObj = Object.assign(obj,this.getDrawObj(wageObj));
            this.drawEvent(assignObj);
        }
        else {

        }
        this.fireEvent();
    }
});
