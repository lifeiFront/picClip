/**
 * @Author byran <lifei@sogou-inc.com>
 * C-Time 2018/5/17.
 */

class picClip {
    /**
     * 相关配置
     * @param config
     * @param el
     */
    constructor(config, el) {
        let defaultConfig = {
            imageBox: '.popup-clip-boxa',//容器元素选择器
            thumbBox: '.popup-clip-boxb',
            spinner: '.spinner',//loading
            imgSrc: '',//要裁切的图片url
            upSpeed: 1.1,//放大速率
            downSpeed: 0.9,//缩小速率
            ratio: '1'//初始图片缩放比例
        };
        config = $.extend({}, defaultConfig, config);
        this.config = config;//合并之后的配置
        this.ratio = config.ratio;
        this.upSpeed = config.upSpeed;
        this.downSpeed = config.downSpeed;
        this.$el = $(el || $(config.imageBox)[0]);
        this.$thumbBox = $(config.thumbBox).eq(0);
        this.$spinner = $(config.spinner).eq(0);
        this.boxWidth = this.$el.width();//容器宽度
        this.boxHeight = this.$el.height();//容器高度
        this.thumbBoxwidth = this.$thumbBox.width();//裁切窗口宽度
        this.thumbBoxHeight = this.$thumbBox.height();//裁切窗口高度
        console.log(this.boxWidth, this.boxHeight, this.thumbBoxwidth, this.thumbBoxHeight);
        this.image = new Image();
        this.init();
    }

    init() {
        let _this = this;
        let imgMouseMove = function (e) {
            e.stopImmediatePropagation();

            if (_this.dragable) {
                let x = e.clientX - _this.mouseX;
                let y = e.clientY - _this.mouseY;

                let bg = _this.$el.css('background-position').split(' ');
                let bgX = x + parseInt(bg[0]);
                let bgY = y + parseInt(bg[1]);

                _this.setBackground(1, bgX, bgY);
                _this.mouseX = e.clientX;
                _this.mouseY = e.clientY;
            }
        };
        let imgMouseUp = function (e) {
            e.stopImmediatePropagation();
            _this.dragable = false;
        };

        let imgMouseDown = function (e) {
            e.stopImmediatePropagation();
            _this.dragable = true;
            _this.mouseX = e.clientX;
            _this.mouseY = e.clientY;
        };
        _this.imgMouseMove = imgMouseMove;//保留函数引用，后面取消绑定使用
        _this.imgMouseUp = imgMouseUp;
        _this.imgMouseDown = imgMouseDown;
        this.image.onload = function () {
            _this.imgWidth = this.width;
            _this.imgHeight = this.height;
            if (_this.imgWidth < _this.thumbBoxwidth || _this.imgHeight < _this.thumbBoxHeight) {//图片宽度或者高度比裁剪框小
                if (_this.imgWidth / _this.imgHeight > _this.thumbBoxwidth / _this.thumbBoxHeight) {//高度
                    _this.ratio = Math.ceil(_this.thumbBoxHeight / _this.imgHeight);
                } else {
                    _this.ratio = Math.ceil(_this.thumbBoxwidth / _this.imgWidth);
                }
            }
            _this.$spinner.hide();
            _this.setBackground(0);
            _this.$el.bind('mousedown', imgMouseDown);
            _this.$el.bind('mousemove', imgMouseMove);
            $(window).bind('mouseup', imgMouseUp);
        };
        this.image.src = this.config.imgSrc;
    }

    destroy() {
        let _this = this;
        $(window).unbind('mouseup', _this.imgMouseUp);
        _this.$el.unbind('mousedown', _this.imgMouseDown);
        _this.$el.unbind('mousemove', _this.imgMouseMove);
    }

    getDataURL() {
        let imageData = null;
        let _this = this;
        try {
            let canvas = document.createElement("canvas"),
                dx = parseInt(_this.bgPositionX) - this.boxWidth / 2 + this.thumbBoxwidth / 2,
                dy = parseInt(_this.bgPositionY) - this.boxHeight / 2 + this.thumbBoxHeight / 2,
                dw = parseInt(_this.bgW),
                dh = parseInt(_this.bgH),
                sh = parseInt(this.imgHeight),
                sw = parseInt(this.imgWidth);
            console.log(dx, dy);
            canvas.width = this.thumbBoxwidth;
            canvas.height = this.thumbBoxHeight;
            let context = canvas.getContext("2d");
            context.drawImage(this.image, 0, 0, sw, sh, dx, dy, dw, dh);
            imageData = canvas.toDataURL('image/png');
        } catch (e) {
            console.log('图片加载出错');
        }
        return imageData;
    }

    getBlob() {//有兼容问题
        let imageData = this.getDataURL();
        let b64 = imageData.replace('data:image/png;base64,', '');
        let binary = atob(b64);
        let array = [];
        for (let i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        return new Blob([new Uint8Array(array)], {type: 'image/png'});
    }

    zoomIn() {//放大
        this.ratio *= this.upSpeed;
        this.setBackground(2);
    }

    zoomOut() {//缩小
        this.ratio *= this.downSpeed;
        this.setBackground(3);
    }


    /**
     * 缩小放大，在达到限制时，控制比例不在缩小，不在重新赋值，可根据一次放大的比例。1.1倍，还原上一个值，不用记录上一个值
     * 缩小放大时，背景图不能重回中心点，需要根据图片放大后，已图片中心为准，计算背景图位置的变化值进行背景图的移动
     * 为避免每次获取背景图的位置信息，每次设置背景图位置时，将其作为属性存下来，方便需要时获取。
     * @param type 1:移动  2：放大  3：缩小  0:初始化
     * @param bgX
     * @param bgY
     */
    setBackground(type, bgX, bgY) {
        let _this = this;
        let w = parseInt(_this.imgWidth) * _this.ratio;
        let h = parseInt(_this.imgHeight) * _this.ratio;
        let pw, ph;
        if (type == 0) {//初始化
            pw = (this.$el.width() - w) / 2;
            ph = (this.$el.height() - h) / 2;
        } else if (type == 1) {//移动
            pw = bgX;
            ph = bgY;
        } else if (type == 2) {//放大
            pw = _this.bgPositionX - (w - _this.bgW) / 2;
            ph = _this.bgPositionY - (h - _this.bgH) / 2;
        } else {//缩小
            pw = _this.bgPositionX - (w - _this.bgW) / 2;
            ph = _this.bgPositionY - (h - _this.bgH) / 2;
        }
        let diffNumW = this.boxWidth / 2 - this.thumbBoxwidth / 2;
        let diffNumH = this.boxHeight / 2 - this.thumbBoxHeight / 2;
        let dx = pw - diffNumW;
        let dy = ph - diffNumH;
        if (type == 3) {//缩小，缩小的时候存在图片比较大，到大边线，缩小后图片不全在裁切框的情况
            if (w > this.thumbBoxwidth && h > this.thumbBoxHeight) {
                if (dx > 0) {//背景图已左上角移动
                    pw = diffNumW;
                }
                if (dy > 0) {//背景图已左上角移动
                    ph = diffNumH;
                }
                if (dx + w < this.thumbBoxwidth) {
                    pw = diffNumW - (w - this.thumbBoxwidth);
                }
                if (dy + h < this.thumbBoxHeight) {
                    ph = diffNumH - (h - this.thumbBoxHeight);
                }
                dx = pw - diffNumW;
                dy = ph - diffNumH;
            }

        }
        if (dx <= 0 && dy <= 0 && dx + w >= this.thumbBoxwidth && dy + h >= this.thumbBoxHeight) {
            if (type !== 1) {
                this.$el.css({
                    'background-image': 'url(' + _this.image.src + ')',
                    'background-size': w + 'px ' + h + 'px',
                    'background-position': pw + 'px ' + ph + 'px',
                    'background-repeat': 'no-repeat'
                });
            } else {
                _this.$el.css('background-position', pw + 'px ' + ph + 'px');
            }
            _this.bgPositionX = pw;//背景图x坐标
            _this.bgPositionY = ph;//背景图y坐标
            _this.bgW = w;//背景图宽
            _this.bgH = h;//背景图高
        } else {
            if (type == 2) {//放大
                _this.ratio = _this.ratio / _this.upSpeed;
            }
            if (type == 3) {//缩小
                _this.ratio = _this.ratio / _this.downSpeed;
            }

        }
    }

}


