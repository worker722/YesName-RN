import { GONEXTPAGE, GOSUCCESS, SECURITY, SECURITYBAR } from "@constants";
import { security, image_uri } from "@utils";
import { uploadFile } from "./api";
import * as logger from "./logger";
import RNBackgroundDownloader from 'react-native-background-downloader';
import RNFS from 'react-native-fs';
import CameraRoll from "@react-native-community/cameraroll";
import ImageMarker from "react-native-image-marker";
import { Images } from "@config";
import { Platform } from "react-native";
import pathParse from 'path-parse';
import * as ApiActions from './api'

export const changeSecurity = (data) => {
  security(data);
  return { type: SECURITY, data };
}
export const changeSecurityBar = (data) => {
  return { type: SECURITYBAR, data };
}
export const goNextPage = (data) => {
  return { type: GONEXTPAGE, data };
}
export const goNextSuccess = () => {
  return { type: GOSUCCESS };
}
export const uploadFile2Server = (file, type) => async dispatch => {
  const formdata = new FormData();
  logger.log("upload file", file);
  formdata.append("file", file);
  formdata.append("type", type);
  const res = await uploadFile(formdata);
  return res;
}
export const downloadFile = (name, url, addWatermark, tostorage = false) => dispatch => {
  const path = pathParse(url);
  if (path.ext?.includes("gif") || name?.includes("gif")) addWatermark = false;
  const download_url = `${Platform.OS == "android" ? RNFS.DownloadDirectoryPath : RNFS.DocumentDirectoryPath}/${Math.floor(Math.random() * 100)}${name}`;
  const isMovie = path.ext?.includes("mp4") || name?.includes("mov");
  return new Promise(async (resolve, reject) => {
    if (isMovie) {
      const add_watermark_res = await ApiActions.addWatermark(url);
      console.log(add_watermark_res);
      if (add_watermark_res.success) {
        url = add_watermark_res.path;
      }
      addWatermark = false;
    }
    if (addWatermark) {
      ImageMarker.markImage({
        src: image_uri(url),
        markerSrc: Images.logo,
        position: "center",
        scale: 1,
        markerScale: .6,
        quality: 100,
        saveFormat: 'png',
        filename: `${Date.now()}`,
        position: 'bottomRight'
      })
        .then(async (res) => {
          console.log("added watermark", image_uri(url));
          await RNFS.copyFile(res, download_url);
          if (tostorage) {
            CameraRoll.save(download_url, { album: "MoRe" })
              .catch(err => logger.log("camera role err", err));
          }
          resolve(download_url)
        })
        .catch((err) => {
          logger.log('add mark error 59', err)
          resolve("")
        });
      return;
    }

    url = image_uri(url).uri
    console.log("download", url, download_url);
    RNBackgroundDownloader.download({
      id: (Math.random() * 100).toString(),
      url,
      destination: download_url
    }).progress((p) => {
      logger.log(`download ${(p * 100).toFixed(2)}%`);
    }).done(() => {
      if (tostorage) {
        CameraRoll.save(download_url, { album: "MoRe" })
          .catch(err => logger.log("camera role err", err));
      }
      if (isMovie) {
        ApiActions.deleteFile(url);
      }
      resolve(download_url);
    }).error((error) => {
      logger.error("download error", error);
      resolve("");
    });
  })
}