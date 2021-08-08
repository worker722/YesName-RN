import PathParse from "path-parse";
import React, { useEffect, useState } from 'react';
import RNBackgroundDownloader from 'react-native-background-downloader';
import RNFS from 'react-native-fs';
import KeepAwake from 'react-native-keep-awake';
import VideoPlayer from "react-native-video-player";
import { logger } from "@actions";

const index = (props) => {
    const [video_url, setVideoUrl] = useState('');
    var downloadVideo = null;
    useEffect(() => {
        let videoPath = props.source?.uri || '';
        console.log(videoPath)
        setVideoUrl(videoPath);
        // const isLocal = !(videoPath?.includes("http://") || videoPath?.includes("https://"));
        // if (isLocal) {
        //     setVideoUrl(videoPath);
        // } else {
        //     donwloadVideoFile(videoPath)
        //         .then(res => setVideoUrl(res))
        //         .catch(error => {
        //             logger.error("download video error", error);
        //             props.onError?.({ error });
        //         });
        // }
        return () => {
            setVideoUrl("")
            // downloadVideo?.stop?.();
        };
    }, [props.source.uri])
    const donwloadVideoFile = (url) => {
        const path = PathParse(url);
        return new Promise(async (resolve, reject) => {
            const download_url = `${RNFS.CachesDirectoryPath}/${path.name}.mp4`;
            const exist = await RNFS.exists(download_url);
            if (exist) {
                console.log("exits", { download_url });
                resolve(download_url);
                return;
            }
            downloadVideo = RNBackgroundDownloader.download({
                id: path.name,
                url,
                destination: download_url
            })
                .progress(p => {
                    console.log(`download ${p.toFixed(2) * 100}%`);
                })
                .done(() => {
                    console.log({ download_url });
                    resolve(download_url);
                })
                .error((error) => {
                    logger.error(error);
                    try {
                        RNFS.unlink(download_url);
                    } catch (error) {

                    }
                    reject(error);
                });
        })
    }
    const onEndVideo = () => {
        if (!props.showControl) {
            setVideoUrl('');
        }
        props?.onEnd?.();
    }
    return (
        <>
            <KeepAwake />
            {!!video_url &&
                <VideoPlayer
                    controls={false}
                    {...props}
                    hideControl={!props.showControl}
                    hideSeekbar={!props.showSeekbar}
                    onEnd={onEndVideo}
                    video={{ uri: video_url }}
                    autoplay
                />
            }
        </>
    )
}

export default index;
