// components/fretboard-viewer/fretboard-viewer.js
var drawModule = null;

Component({
  properties: {
    canvasWidth: { type: Number, value: 350 },
    canvasHeight: { type: Number, value: 280 },
    stringDetails: { type: Array, value: [] },
    fingerings: { type: Array, value: [] },
    maxFret: { type: Number, value: 5 },
    currentIndex: { type: Number, value: 0 },
  },

  observers: {
    currentIndex: function () {
      this.drawCanvas();
    },
  },

  lifetimes: {
    attached: function () {
      var self = this;
      wx.nextTick(function () {
        self.drawCanvas();
        self.triggerEvent('ready');
      });
    },
  },

  methods: {
    drawCanvas: function () {
      var self = this;
      if (!drawModule) {
        drawModule = require('../../utils/draw');
      }

      var query = wx.createSelectorQuery().in(this);
      query
        .select('#fretboardCanvas')
        .fields({ node: true, size: true })
        .exec(function (res) {
          if (!res || !res[0]) return;
          var canvas = res[0].node;
          if (!canvas) return;
          var ctx = canvas.getContext('2d');
          var dpr = wx.getSystemInfoSync().pixelRatio;

          var w = self.data.canvasWidth;
          var h = self.data.canvasHeight;
          canvas.width = w * dpr;
          canvas.height = h * dpr;
          ctx.scale(dpr, dpr);

          drawModule.drawFretboard(ctx, {
            width: w,
            height: h,
            maxFret: self.data.maxFret,
            fingerings: self.data.fingerings,
            currentIndex: self.data.currentIndex,
          });
        });
    },

    saveToAlbum: function () {
      return new Promise(
        function (resolve, reject) {
          wx.showLoading({ title: '保存中...' });
          var query = wx.createSelectorQuery().in(this);
          query
            .select('#fretboardCanvas')
            .fields({ node: true, size: true })
            .exec(function (res) {
              if (!res || !res[0]) {
                wx.hideLoading();
                reject(new Error('canvas not found'));
                return;
              }
              var canvas = res[0].node;
              wx.canvasToTempFilePath({
                canvas: canvas,
                success: function (res) {
                  wx.saveImageToPhotosAlbum({
                    filePath: res.tempFilePath,
                    success: function () {
                      wx.hideLoading();
                      wx.showToast({ title: '保存成功', icon: 'success' });
                      resolve();
                    },
                    fail: function () {
                      wx.hideLoading();
                      wx.showToast({ title: '保存失败，请授权相册', icon: 'none' });
                      reject(new Error('save failed'));
                    },
                  });
                },
                fail: function () {
                  wx.hideLoading();
                  wx.showToast({ title: '生成图片失败', icon: 'none' });
                  reject(new Error('generate failed'));
                },
              });
            });
        }.bind(this)
      );
    },
  },
});
