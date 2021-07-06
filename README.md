# imagePrinter
将图片转换成制定字符串（轮廓）输出

# Usage
```

let logImg = new logImage({
  imagePath: "./sources/test.png",
});
logImg
  .print()
  .then((res) => {
    console.log("done: ", res);
    document.querySelector(".res").innerHTML = res;
  })
  .catch((err) => {
    console.log(err);
  });

```
