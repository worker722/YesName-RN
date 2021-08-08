import React, { Component } from 'react'
import { View, FlatList, Image } from 'react-native'
import { connect } from 'react-redux'
import styles from "./styles";
import * as reduxActions from "@actions";
import { compareDate, image_uri } from "@utils";
import { Header, Icon, MediaItem } from "@components";
import { ButtonGroup } from 'react-native-elements';
import { BaseColor, BaseConfig } from "@config";
const { ApiActions } = reduxActions;
const { CONTENTTYPE } = BaseConfig;
export class index extends Component {
    state = {
        mediaIndex: 0,
        medias: []
    }
    componentDidMount() {
        const { userid } = this.props.route.params;
        this.props.showLoading(true);
        ApiActions.getAllMedia(userid)
            .then(res => {
                this.procesdData(res);
            })
            .catch(err => console.error(err))
            .finally(() => this.props.showLoading(false));
    }
    procesdData({ chats, galleries }) {
        let chat_medias = chats
            .map(item => {
                try {
                    return { ...JSON.parse(item.attach), date: item.created_at, type: item.type };
                } catch (error) {

                }
                return null;
            }).map(item => item);
        let gallery_medias = galleries.map(item => ({ url: item.link, date: item.created_at, type: item.type == 0 ? CONTENTTYPE.IMAGE : CONTENTTYPE.VIDEO }));

        let medias = [...chat_medias, ...gallery_medias];
        medias = medias.sort((a, b) => compareDate(a?.date, b?.date, false)).filter(item => item);
        this.setState({ medias });
    }
    onGoBack() {
        this.props.navigation.goBack();
    }
    get selectedMedia() {
        const { medias, mediaIndex } = this.state;
        try {
            const data = medias.filter(item => mediaIndex == 1 ? item.type == CONTENTTYPE.FILE : (item.type == CONTENTTYPE.IMAGE || item.type == CONTENTTYPE.VIDEO))
            const tmpArr = new Array(4 - Math.floor(data.length % 4)).fill({ empty: true });
            return [...data, tmpArr];
        } catch (error) {
        }
        return [];
    }
    onPressItem({ item, index }) {
        const { medias } = this.state;
        if (item.type == CONTENTTYPE.IMAGE) {
            let data = medias.filter(media => media.type == item.type);
            index = data.findIndex(ele => ele.url == item.url);
            this.props.navigation.navigate("PreviewImage", { images: data, index })
        } else if (item.type == CONTENTTYPE.VIDEO) {
            this.props.navigation.navigate("VideoViewer", { url: item.url })
        }
    }
    render() {
        return (
            <View style={styles.container}>
                <Header
                    title={"Media"}
                    renderLeft={<Icon name={'angle-left'} size={24} />}
                    onPressLeft={this.onGoBack.bind(this)}
                // renderCenter={
                //     <ButtonGroup
                //         containerStyle={{ height: 40, borderRadius: 8 }}
                //         selectedButtonStyle={{ margin: 4, borderRadius: 8 }}
                //         textStyle={{ fontSize: 16 }}
                //         buttons={['Media', "Files"]}
                //         selectedIndex={mediaIndex}
                //         onPress={mediaIndex => this.setState({ mediaIndex })}
                //     />
                // }
                />
                <FlatList
                    numColumns={4}
                    data={this.selectedMedia}
                    contentContainerStyle={{ padding: 5 }}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={data => <MediaItem {...data} onPress={this.onPressItem.bind(this, data)} />}
                />
            </View>
        )
    }
}

const mapStateToProps = (state) => (state)

const mapDispatchToProps = {
    ...reduxActions
}

export default connect(mapStateToProps, mapDispatchToProps)(index)
