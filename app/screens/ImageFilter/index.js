import * as reduxActions from "@actions";
import { Icon } from "@components";
import { BaseColor, Filters, Images } from "@config";
import CameraRoll from "@react-native-community/cameraroll";
import { image_uri } from "@utils";
import React, { Component } from "react";
import {
    FlatList,
    Image,

    ImageBackground,
    Text,
    TouchableOpacity, View
} from 'react-native';
import ImageMarker from "react-native-image-marker";
import { connect } from "react-redux";
import styles from "./styles";
const { logger } = reduxActions;

class ImageFilter extends Component {
    constructor(props) {
        super(props);
        let { route: { params: { uri, onDone } } } = this.props;
        this.uri = `file:///${uri}`;
        this.onDone = onDone;
        this.state = {
            selectedFilterIndex: 0,
        };
        this.selectedImage = this.uri;
    }

    onExtractImage = ({ nativeEvent }) => {
        this.selectedImage = nativeEvent.uri;
    };
    renderFilterComponent = ({ item, index }) => {
        const active = this.state.selectedFilterIndex == index;
        const FilterComponent = item.filterComponent;
        return (
            <TouchableOpacity onPress={() => { this.setState({ selectedFilterIndex: index }) }}>
                <FilterComponent
                    image={
                        <Image
                            style={[styles.filterSelector, active && { borderColor: BaseColor.mintgreen, borderWidth: 3 }]}
                            source={image_uri(this.uri)}
                            resizeMode={'cover'}
                        />
                    } />
                <Text style={styles.filterTitle}>{item.title}</Text>
            </TouchableOpacity>
        );
    };
    downloadImage() {
        this.props.showLoading(true, "Downloading");
        ImageMarker.markImage({
            src: { uri: this.selectedImage },
            markerSrc: Images.logo,
            position: "center",
            scale: 1,
            markerScale: .6,
            quality: 100,
            saveFormat: 'png',
            filename: `${Date.now()}`,
            position: 'bottomRight'
        })
            .then(async (path) => {
                CameraRoll.save(path, { type: "photo", album: "MoRe" })
                    .then(res => this.props.showToast(`Successfully saved`))
                    .catch(err => logger.log("role err", err));
            })
            .catch((err) => logger.log('add mark error', err))
            .finally(() => this.props.showLoading(false))
    }
    gotoNext() {
        this.onDone(this.selectedImage);
        this.props.navigation.goBack();
    }
    render() {
        const { selectedFilterIndex } = this.state;
        const SelectedFilterComponent = Filters[selectedFilterIndex].filterComponent;
        return (
            <View style={styles.container}>
                <View style={{ flex: 1, width: "100%", marginBottom: 80 }}>
                    {selectedFilterIndex === 0 ? (
                        <Image
                            style={styles.image}
                            source={image_uri(this.uri)}
                            resizeMode={'contain'}
                        />
                    ) : (
                        <SelectedFilterComponent
                            style={{ width: "100%", flex: 1 }}
                            onExtractImage={this.onExtractImage.bind(this)}
                            extractImageEnabled={false}
                            image={
                                <Image
                                    style={styles.image}
                                    source={image_uri(this.uri)}
                                    resizeMode={'contain'}
                                />
                            }
                        />
                    )}
                </View>
                <View style={styles.action_bar}>
                    <TouchableOpacity onPress={() => this.props.navigation.goBack()} style={[styles.center, styles.action]}>
                        <Icon name={"close"} size={26} color={BaseColor.whiteColor} type="Ionicons" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.downloadImage.bind(this)} style={[styles.center, styles.action]}>
                        <Icon name={"download"} size={26} color={BaseColor.whiteColor} type="Entypo" />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity style={[styles.center, styles.action]} onPress={this.gotoNext.bind(this)} >
                        <Icon name={"check"} size={26} color={BaseColor.whiteColor} />
                    </TouchableOpacity>
                </View>
                <View style={{ height: 150, width: "100%", position: "absolute", bottom: 0 }}>
                    <ImageBackground source={Images.toolbar_back} resizeMode={"stretch"} style={[styles.bottom_list]}>
                        <FlatList
                            data={Filters}
                            keyExtractor={item => item.title}
                            horizontal={true}
                            renderItem={this.renderFilterComponent.bind(this)}
                        />
                    </ImageBackground>
                </View>
            </View>
        );
    };
};
const mapStateToProps = (state) => (state)
const mapDispatchToProps = {
    ...reduxActions
}
export default connect(mapStateToProps, mapDispatchToProps)(ImageFilter);