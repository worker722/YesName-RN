import React, { Component } from 'react'
import { View, Image } from 'react-native'
import { image_uri } from "@utils";
import { Icon } from "@components";
import { BaseColor, BaseConfig, Images } from "@config";
import pathParse from 'path-parse';
const { CONTENTTYPE } = BaseConfig;
import { SvgXml } from 'react-native-svg';
import { TouchableOpacity } from 'react-native';

const videoSVG = `  <svg width="72px" height="54px" viewBox="0 0 72 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <title>Group</title>
                        <desc>Created with Sketch.</desc>
                        <g id="qq" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <g id="qq" transform="translate(-1177.000000, -1108.000000)" fill-rule="nonzero">
                                <g id="Group" transform="translate(1177.000000, 1108.000000)">
                                    <rect id="Rectangle-79" x="0" y="0" width="72" height="54"></rect>
                                    <path d="M16,27 C16,15.954305 24.954305,7 36,7 C47.045695,7 56,15.954305 56,27 C56,38.045695 47.045695,47 36,47 L18,47 C16.8954305,47 16,46.1045695 16,45 L16,27 Z M36,43 C44.836556,43 52,35.836556 52,27 C52,18.163444 44.836556,11 36,11 C27.163444,11 20,18.163444 20,27 C20,35.836556 27.163444,43 36,43 Z M24.6930988,40.90844 C23.4031109,41.3575293 22.2503902,42.0317946 21.2349365,42.9312359 C20.2194829,43.8306772 19.6323618,44.6102263 19.4735734,45.2698831 L22.9507608,45.2698831 C23.0441493,45.1066024 23.4542687,44.7559107 24.1811193,44.2178081 C24.9079698,43.6797056 25.8475967,43.2508482 27,42.9312359 L24.6930988,40.90844 Z M40,24 C37.790861,24 36,22.209139 36,20 C36,17.790861 37.790861,16 40,16 C42.209139,16 44,17.790861 44,20 C44,22.209139 42.209139,24 40,24 Z M45,33 C42.790861,33 41,31.209139 41,29 C41,26.790861 42.790861,25 45,25 C47.209139,25 49,26.790861 49,29 C49,31.209139 47.209139,33 45,33 Z M37,39 C34.790861,39 33,37.209139 33,35 C33,32.790861 34.790861,31 37,31 C39.209139,31 41,32.790861 41,35 C41,37.209139 39.209139,39 37,39 Z M28,34 C25.790861,34 24,32.209139 24,30 C24,27.790861 25.790861,26 28,26 C30.209139,26 32,27.790861 32,30 C32,32.209139 30.209139,34 28,34 Z M36,29 C34.8954305,29 34,28.1045695 34,27 C34,25.8954305 34.8954305,25 36,25 C37.1045695,25 38,25.8954305 38,27 C38,28.1045695 37.1045695,29 36,29 Z M30,25 C27.790861,25 26,23.209139 26,21 C26,18.790861 27.790861,17 30,17 C32.209139,17 34,18.790861 34,21 C34,23.209139 32.209139,25 30,25 Z" id="Combined-Shape" fill="${BaseColor.whiteColor}"></path>
                                </g>
                            </g>
                        </g>
                    </svg>`;
const audioSvg = `  <svg width="72px" height="54px" viewBox="0 0 72 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <title>Group 3</title>
                        <desc>Created with Sketch.</desc>
                        <g id="audio" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <g id="audio" transform="translate(-1177.000000, -1034.000000)">
                                <g id="Group-3" transform="translate(1177.000000, 1034.000000)">
                                    <rect id="Rectangle-79"  x="0" y="0" width="72" height="54"></rect>
                                    <g id="Group-2" transform="translate(16.000000, 7.000000)" fill="#fff" opacity="0.66">
                                        <path d="M20.0003366,0 C11.9112224,0 4.61866091,4.87278944 1.52309507,12.3461924 C-1.57268892,19.8195954 0.138495017,28.4217508 5.85834891,34.1415954 C11.5782028,39.8614399 20.1805904,41.5726211 27.6537874,38.4770603 C35.1272026,35.3814995 40,28.0890045 40,19.999849 C39.9889284,8.95879005 31.0411953,0.0112897051 20.0003366,0 Z M20.0000243,36.0001421 C11.1633497,36.0001421 4,28.8366097 4,20.0001439 C4,11.1634838 11.1633497,4 20.0000243,4 C28.8366989,4 36,11.1634838 36,20.0001439 C35.9901395,28.8324324 28.8325215,35.9900873 20.0000243,36.0001421 Z" id="Fill-1"></path>
                                        <path d="M23,15.1037204 L23,26.1958783 C23,28.4050173 21.209139,30.1958783 19,30.1958783 C16.790861,30.1958783 15,28.4050173 15,26.1958783 C15,23.9867393 16.790861,22.1958783 19,22.1958783 C19.3452996,22.1958783 19.6803801,22.2396313 20,22.3218958 L20,13.1958783 L20.0586332,13.1958783 L20,13.1573463 C21.5066683,12.1900535 23.0133365,11.2227606 24.5200048,10.2554678 C25.2685188,9.77491587 26.2648737,9.99214212 26.7454256,10.7406562 C26.7958656,10.8192223 26.8393785,10.9020255 26.8754726,10.9881303 L26.8984705,11.0429932 C27.303519,12.0092617 26.8942015,13.1243501 25.9601992,13.5990909 L23,15.1037204 Z" id="Combined-Shape"></path>
                                    </g>
                                </g>
                            </g>
                        </g>
                    </svg>`;


export default class index extends Component {
    // item.type -> CONTENTTYPE :{FILE, IMAGE, VIDEO, AUDIO}
    render() {
        const { item, onPress } = this.props;
        if (!item?.url) return <View style={{ flex: 1 }} />
        const path = pathParse(item.url);
        let image = ``;
        let svg = ``;
        const gificon = path?.ext.search("gif") >= 0;
        switch (item.type) {
            case CONTENTTYPE.VIDEO:
                image = item.thumbnail?.path;
                svg = videoSVG;
                break;
            case CONTENTTYPE.IMAGE:
                image = item.url;
                break;
            case CONTENTTYPE.AUDIO:
                svg = audioSvg;
                break;
        }
        return (
            <TouchableOpacity style={{ flex: 1, height: 100, margin: 3, position: "relative", overflow: "hidden", justifyContent: "flex-end" }} onPress={onPress}>
                {image ?
                    <Image source={image_uri(image)} style={{ width: "100%", height: "100%" }} resizeMode={'cover'} />
                    :
                    <SvgXml width="100" height="100" xml={svg} />
                }
                <View style={{ position: "absolute", width: "100%", paddingHorizontal: 10, backgroundColor: "#00000044" }}>
                    {gificon && <Icon name={"gif"} color={BaseColor.whiteColor} size={26} type={'MaterialCommunityIcons'} />}
                    {!!svg && <SvgXml width="27" height="27" xml={svg} />}
                </View>
            </TouchableOpacity>
        )
    }
}
