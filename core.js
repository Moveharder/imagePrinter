/**
 * 图片转轮廓字符串类
 * @param {*} options
 */
function logImage(options = {}) {
  let defaultOptions = {
    imagePath: "",
    quality: 6, //0~10，越小越清晰，输出内容越大
    lightFill: " ", //明亮区域（yuv的y >= 190）填充内容
    darkFill: "x", //幽暗区域填充内容
  };

  let opts = Object.assign(defaultOptions, options);

  this.imageUrl = opts.imagePath;
  this.quality = opts.quality;
  this.lightFill = opts.lightFill;
  this.darkFill = opts.darkFill;
}

/**加载图片资源 */
logImage.prototype.loadImage = function () {
  return new Promise((resolve, reject) => {
    this.img = new Image();
    this.img.src = this.imageUrl;
    this.img.onload = () => {
      resolve(this.img);
    };
    this.img.onerror = (err) => {
      reject({
        message: "call loadImage error.",
        error: new Error("图片加载失败"),
      });
    };
  });
};

/**获取图片的iamgeData数据 */
logImage.prototype.getImageData = function () {
  return new Promise((resolve, reject) => {
    try {
      this.canvas = document.createElement("canvas");
      let img = this.img;
      this.canvas.width = img.width;
      this.canvas.height = img.height;
      const ctx = this.canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, img.width, img.height);
      const imgData = ctx.getImageData(0, 0, img.width, img.height).data;
      resolve(imgData);
    } catch (err) {
      reject({ message: "call getImageData error.", ...err });
    }
  });
};

/**将iamgeData数据转为由用户设定的字符规则的字符串(图片轮廓) */
logImage.prototype.turnImageData2Str = function (imageData) {
  return new Promise((resolve, reject) => {
    try {
      let img = this.img;
      let gap = this.quality;
      let str = "";
      for (let h = 0; h < img.height; h += gap) {
        str += "\n";
        for (let w = 0; w < img.width; w += gap) {
          str += " "; // 因为字符的高度普遍都比其宽度大，所以额外添加一个空字符平衡一下，否则最终的图形会感觉被拉高了
          let pos = (h * img.width + w) * 4;
          let r = imageData[pos];
          let g = imageData[pos + 1];
          let b = imageData[pos + 2];
          // rgb转换成yuv格式，根据y（亮度）来判断显示什么字符
          let y = this.rgb2yuv(r, g, b);
          if (y >= 190) {
            // 浅色
            str += this.lightFill;
          } else {
            // 深色
            str += this.darkFill;
          }
        }
        resolve(str);
      }
    } catch (err) {
      reject({ message: "call turnImageData2Str error.", ...err });
    }
  });
};

/**rgb转亮度yuv */
logImage.prototype.rgb2yuv = function (r = 0, g = 0, b = 0) {
  return r * 0.299 + g * 0.578 + b * 0.114;
};

/**返回图像轮廓字符串 */
logImage.prototype.print = function () {
  return new Promise((resolve, reject) => {
    this.loadImage()
      .then((img) => {
        console.log("step1: 生成图片");
        return img;
      })
      .then((image) => {
        console.log("step2: 获取图片像素数据");
        return this.getImageData(image);
      })
      .then((imageData) => {
        console.log("step3: 将图片像素数据转化为设定的字符串");
        return this.turnImageData2Str(imageData);
      })
      .then((imageStr) => {
        console.log("finished");
        resolve(imageStr);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
