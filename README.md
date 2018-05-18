# picClip
pc端图片裁切上传 h5，固定裁剪框，放大缩小，移动图片

> 使用简单，实例化对象就可，对象中包含放大缩小图像，获取裁切后base64编码的图片，也可获取blob二进制对象（浏览器有兼容问题）；页面有使用示例，具体相关逻辑用法，代码中有清晰的注释。


```javascript
//使用方法
let clipobj = new picClip({
    imgSrc: '../images/avatar.png'
});

clipobj对象暴露的方法
zoomOut()//缩小
zoomIn()//放大
getDataURL();
getBlob();
//初始化配置，配置可传递的参数
let defaultConfig = {
    imageBox: '.popup-clip-boxa',//容器元素选择器
    thumbBox: '.popup-clip-boxb',//裁剪框选择器
    spinner: '.spinner',//loading
    imgSrc: '',//要裁切的图片url
    upSpeed: 1.1,//放大速率
    downSpeed: 0.9,//缩小速率
    ratio: '1'//初始图片缩放比例
};
```
