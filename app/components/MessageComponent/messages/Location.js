
import { Text } from "@components";
import React, { Component } from "react";
import { TouchableOpacity, View } from "react-native";
import MapView, { Marker } from 'react-native-maps';
import { BaseColor } from "@config";

export default class Location extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { data, onPressMap, onLongPress, isVisited } = this.props;
        if (!data) return <></>;
        return (
            <TouchableOpacity
                activeOpacity={1}
                onPress={onPressMap}
                onLongPress={onLongPress}
            >
                <MapView
                    style={{ width: 250, height: 200 }}
                    ref={(ref) => this.mapRef = ref}
                    showsCompass={false}

                    initialCamera={{
                        center: data,
                        heading: 0,
                        pitch: 1,
                        zoom: 10,
                        altitude: 0,
                    }}
                    initialRegion={{
                        latitude: data.latitude,
                        longitude: data.longitude,
                        latitudeDelta: .2,
                        longitudeDelta: .2
                    }}
                    pitchEnabled={false}
                    scrollEnabled={false}
                    toolbarEnabled={false}
                    cacheEnabled={false}
                    loadingEnabled={false}
                    rotateEnabled={false}
                    zoomControlEnabled={false}
                    zoomEnabled={false}
                    zoomTapEnabled={false}
                    onPress={onPressMap}
                >
                    <Marker coordinate={data} />
                </MapView>
                <Text subhead style={{ padding: 15, width: 250 }}>{data.description}</Text>
                {isVisited &&
                    <View style={{ backgroundColor: BaseColor.grayColor, opacity:.8, position: "absolute", width: "100%", height: "100%" }} />}
            </TouchableOpacity>
        )
    }
}