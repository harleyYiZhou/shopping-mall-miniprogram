// pages/catagory/catagory.js
var app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tapIndex: 0,
    selected: '2',
    catagory:{
      levelOne:[
        {
          title: "有品推荐",
          leverSec: [
            {
              title: "小米6",
              src:"../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src:"../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src:"../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src:"../../image/img/food1.jpg"
            }
          ]
        },
        {
          title:" 手机",
          leverSec: [
            {
              title: "小米5",
              src:"../../image/img/food1.jpg"
            },
            {
              title: "小米5",
              src:"../../image/img/food1.jpg"
            },
            {
              title: "小米aha",
              src:"../../image/img/food1.jpg"
            },
            {
              title: "小米66",
              src:"../../image/img/food1.jpg"
            }
          ]
        },
        {
          title: "笔记本",
          leverSec: [
            {
              title: "小米6",
              src:"../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src:"../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src:"../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src:"../../image/img/food1.jpg"
            }
          ]
        },
        {
          title: "有品推荐",
          leverSec: [
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            }
          ]
        },
        {
          title: " 手机",
          leverSec: [
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            }
          ]
        },
        {
          title: "笔记本",
          leverSec: [
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            }
          ]
        },
        {
          title: "有品推荐",
          leverSec: [
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            }
          ]
        },
        {
          title: " 手机",
          leverSec: [
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            }
          ]
        },
        {
          title: "笔记本",
          leverSec: [
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            }
          ]
        },
        {
          title: "有品推荐",
          leverSec: [
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            }
          ]
        },
        {
          title: " 手机",
          leverSec: [
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            }
          ]
        },
        {
          title: "笔记本",
          leverSec: [
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            }
          ]
        },
        {
          title: "有品推荐",
          leverSec: [
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            }
          ]
        },
        {
          title: " 手机",
          leverSec: [
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            }
          ]
        },
        {
          title: "笔记本",
          leverSec: [
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            }
          ]
        },
        {
          title: "有品推荐",
          leverSec: [
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            }
          ]
        },
        {
          title: " 手机",
          leverSec: [
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            }
          ]
        },
        {
          title: "笔记本",
          leverSec: [
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            }
          ]
        },
        {
          title: "有品推荐",
          leverSec: [
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            }
          ]
        },
        {
          title: " 手机",
          leverSec: [
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            }
          ]
        },
        {
          title: "笔记本",
          leverSec: [
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            },
            {
              title: "小米6",
              src: "../../image/img/food1.jpg"
            }
          ]
        }
        
      ]
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!this.data.locale || this.data.locale !== app.globalData.locale) {
      app.translate.langData(this);
    }
    console.log(wx.getSystemInfoSync().windowWidth);
    console.log(wx.getSystemInfoSync().windowHeight);
    var scrollHeight = wx.getSystemInfoSync().windowHeight / wx.getSystemInfoSync().windowWidth*750;
    console.log(scrollHeight);
    this.setData({
      scrollHeight: scrollHeight-170
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },
  btmNavLink: app.btmNavLink,
  chooseLevel:function(e){
    this.setData({
      tapIndex: e.currentTarget.dataset.index
    })
  }
})