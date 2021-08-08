
import { Icon, Text } from "@components";
import { BaseColor } from "@config";
import { image_uri, translate } from "@utils";
import React, { Component } from "react";
import { ActivityIndicator, TouchableOpacity, View, Platform } from "react-native";
import RNBackgroundDownloader from 'react-native-background-downloader';
import RNFS from 'react-native-fs';
import { logger } from "@actions";

const DOWNLOAD = {
    INIT: 0,
    STARTDOWNLOAD: 1,
    DOWNLOADSUCCESS: 2,
    DOWNLOADFAILED: 3
}

export default class File extends Component {
    constructor(props) {
        super(props);
        this.state = {
            downloading: DOWNLOAD.INIT,
        };
    }
    componentDidMount() {
    }
    async downloadFile({ name, url }) {
        const download_url = `${Platform.OS == "android" ? RNFS.DownloadDirectoryPath : RNFS.DocumentDirectoryPath}/${name}`;
        this.setState({ downloading: DOWNLOAD.STARTDOWNLOAD }, () => {
            RNBackgroundDownloader.download({
                id: (Math.random() * 100).toString(),
                ...image_uri(url, "url"),
                destination: download_url
            }).begin((expectedBytes) => {
            }).progress((percent) => {
                console.log(`Downloaded: ${percent * 100}%`);
            }).done(() => {
                this.setState({ downloading: DOWNLOAD.DOWNLOADSUCCESS }, () => {
                    setTimeout(() => {
                        this.setState({ downloading: DOWNLOAD.INIT })
                    }, 4000);
                });
                this.props.onVisiteMessage();
                this.props.showToast(`${translate("Download is done!")} \n ${download_url}`);
            }).error((error) => {
                this.setState({ downloading: DOWNLOAD.DOWNLOADFAILED }, () => {
                    setTimeout(() => {
                        this.setState({ downloading: DOWNLOAD.INIT })
                    }, 4000);
                });
                this.props.showToast("Download canceled due to error");
                logger.error('Download canceled due to error: ', error);
                this.props.onVisiteMessage();
            });
        });
    }
    render() {
        const { data, isVisited } = this.props;
        const { downloading } = this.state;
        if (!data) return <></>;
        const iconColor = isVisited ? BaseColor.grayColor : BaseColor.primaryColor;
        return (
            <View style={{ padding: 10, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                <TouchableOpacity disabled={isVisited} onPress={() => this.downloadFile(data)}>
                    {downloading == DOWNLOAD.STARTDOWNLOAD ?
                        <ActivityIndicator style={{ marginRight: 10 }} color={iconColor} />
                        :
                        downloading == DOWNLOAD.INIT ?
                            <Icon name={'file-download'} size={28} color={iconColor} style={{ marginRight: 10 }} />
                            :
                            downloading == DOWNLOAD.DOWNLOADSUCCESS ?
                                <Icon name={'check'} size={22} color={iconColor} style={{ marginRight: 10 }} />
                                :
                                <Icon name={'sync'} size={22} color={BaseColor.redColor} style={{ marginRight: 10 }} />
                    }
                </TouchableOpacity>
                <Text style={{ maxWidth: "85%" }}>{data.name}</Text>
            </View>
        )
    }
}