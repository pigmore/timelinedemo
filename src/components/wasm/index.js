
const InitFFCodecReq = 0;
const CloseFFDecodeReq = 1;
const StartDecodeReq = 2;
const AudioPCMFrameRsp = 3;
const VideoRGBFrameRsp = 4;
const OnMessageEvent = 5;
const StartDecodeEndRsp = 6;
const InitFFCodecRsp = 7;
const MediaInfoRsp = 8;
const StopDecodeReq = 9;
const StopDecodeRsp = 10;

/**
 * 视频读帧函数
 * @param {*} worker 必须传入 public/readFrame-lib/readFrameWorker.js
 * @param {*} videoFile 传入需要解析的视频文件
 * @param {*} outputWidth 输出视频的宽度
 * @param {*} outputHeight 输出视频的高度
 * @param {*} readFrameList 需要阅读的帧数，请用 "200, 300, 44444" 这样子的数组传入
 * @param {*} isReadFrameBusy 读帧函数当前处于什么状态
 * @param {*} callback 回调函数：会返回图片的 blob 地址
 */
const readFrame = (
  worker,
  videoFile,
  outputWidth,
  outputHeight,
  readFrameList,
  // isReadFrameBusy,
  currentReadFrameVideoIndex,
  callback,
  callbackContinue,
) => {
  // isReadFrameBusy = true;

  // console.log(
  //   "execute readFrame file",
  //   currentReadFrameVideoIndex.value,
  //   videoFile.name,
  //   readFrameList
  // );
  // 初始化：传入 videoFile、outputWidth、outputHeiight
  console.log(readFrameList,'readFrame????')

  worker.postMessage({
    what: InitFFCodecReq,
    isDebug: 0,
    fileSize: -1,
    fileData: null,
    file: videoFile,
    disableType: 1,
    outScaleWidth: outputWidth,
    outScaleHeight: outputHeight,
    isAddBlack: 0,
    outFps: 10,
    ffthreadCount: 1,
    outVideoFormat: -1
  });

  // 监听消息
  worker.onmessage = function (response) {
    const data = response.data;
    console.log(readFrameList,'timestamp????')
    console.log(data,'timestamp????')
    switch (data.what) {
      case VideoRGBFrameRsp:
        // 获取返回参数
        var rgbBuffers = data.data;
        var timestamp = data.timestamp;
        var rgbSize = data.size;
        var videoWidth = data.width;
        var videoHeight = data.height;
        console.log(timestamp,'timestamp????')
        // 创建一个 RGBA 的容器
        var imageData = new ImageData(rgbBuffers, videoWidth, videoHeight);

        var canvas = new OffscreenCanvas(videoWidth, videoHeight);

        var context = canvas.getContext("2d");

        context.putImageData(imageData, 0, 0, 0, 0, videoWidth, videoHeight);

        canvas
          .convertToBlob()
          .then(blob =>
            callback(
              URL.createObjectURL(blob),
              timestamp,
              currentReadFrameVideoIndex
              // Mapping.ms2Frame(timestamp, 30)

            )
          );
        break;
      case OnMessageEvent:
        break;
      case StartDecodeEndRsp:
        console.log('StartDecodeEndRsp','before call back')
        // isReadFrameBusy = false;
        callbackContinue();

        break;
      case InitFFCodecRsp:
        worker.postMessage({
          what: StartDecodeReq,
          startTimeMs: 0,
          endTimeMs: -1,
          rangeFrameCounts: readFrameList
        });
        break;
      case StopDecodeRsp:
        break;
      case MediaInfoRsp:
        console.log(response,'????MediaInfoRsp???? ????')
        break;
    }
  };
};

export default { readFrame };
