import * as reduxActions from "@actions";
import { Avatar, Icon, Text } from "@components";
import { BaseColor, Images } from "@config";
import { translate, getCurLan } from "@utils";
import React, { Component } from "react";
import { Linking, ImageBackground, TouchableOpacity, View } from "react-native";
import Geocoder from 'react-native-geocoding';
import GetLocation from 'react-native-get-location';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { Marker } from 'react-native-maps';
import { connect } from "react-redux";
import styles from "./styles";
const { logger } = reduxActions;
import { ButtonGroup } from 'react-native-elements';
const _MAPTYPE = ['standard', "satellite", "hybrid"];
import OpenMap from "react-native-open-map";

class CustomMapView extends Component {
  constructor(props) {
    super(props);
    let { route: { params } } = this.props;
    this.params = params;

    let pinLocation = {
      latitude: 46.8182,
      longitude: 8.2275,
      description: "Switzerland",
    };
    if (this.params.viewable) {
      pinLocation = this.params.data;
    }
    this.state = {
      getMyLocation: false,
      pinLocation,
      mapType: 0,
      search_location: false
    }
    Geocoder.init(global.config?.google_map_api_key);
  }
  componentDidMount() {
    if (this.params.viewable) return;
    const { getMyLocation } = this.state;
    if (getMyLocation) return;
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    })
      .then(location => {
        this.setState({ getMyLocation: true });
        this.changeLocation(location);
      })
      .catch(error => {
        logger.error("get my location error", error);
      })
  }
  async getDescriotion(location) {
    try {
      const res = await Geocoder.from(location);
      return res.results[0].formatted_address;
    } catch (err) {
      logger.error("get location error", err);
    }
    return "";
  }
  async touchMap({ nativeEvent }) {
    if (this.params.viewable) return;
    const { coordinate } = nativeEvent;
    this.changeLocation(coordinate);
  }
  async changeLocation(pinLocation, duration = 1000) {
    if (!pinLocation.description) {
      pinLocation.description = await this.getDescriotion(pinLocation);
    }
    this.setState({ pinLocation });
    this.mapRef?.animateCamera({ center: pinLocation }, { duration });
  }
  onAutoComplete(data, details) {
    const location = details?.geometry?.location;
    this.changeLocation({ longitude: location.lng, latitude: location.lat, description: data.description });
  }
  onConfirm() {
    this.params.onConfirm(this.state.pinLocation);
    this.onClose();
  }
  onClose() {
    this.props.navigation.goBack();
  }
  share() {
    const { pinLocation } = this.state;
    OpenMap.show({
      latitude: pinLocation.latitude,
      longitude: pinLocation.longitude,
      title: pinLocation.description,
    });
  }
  render() {
    const { pinLocation, getMyLocation, mapType, search_location } = this.state;
    const { auth: { user } } = this.props;
    if ((!getMyLocation && this.viewable) || !pinLocation) return <></>;
    return (
      <View style={styles.container}>
        <View style={{ width: "100%", flexDirection: "row", paddingTop: 25, paddingBottom: 10, alignItems: "center" }}>
          <TouchableOpacity onPress={this.props.navigation.goBack} style={{ padding: 10 }}>
            <Icon name={"angle-left"} size={30} color={BaseColor.grayColor} />
          </TouchableOpacity>
          {search_location ?
            <>
              <GooglePlacesAutocomplete
                placeholder={translate('Search')}
                fetchDetails={true}
                onPress={this.onAutoComplete.bind(this)}
                query={{
                  key: global.config?.google_map_api_key,
                  language: getCurLan() == "en" ? "en" : 'de',
                }}
                styles={{
                  container: { flex: 1, position: "absolute", top: 25, left: 40, right: 40, zIndex: 999 },
                  textInput: { ...styles.autocomplete_input },
                }}
              />
              <View style={{ flex: 1 }} />
            </>
            :
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <Text title3 style={{ textAlign: "center" }}>{pinLocation.description}</Text>
              <Text subhead grayColor style={{ textAlign: "center" }}>{`${pinLocation.latitude}° N, ${pinLocation.longitude}° E`}</Text>
            </View>
          }
          <TouchableOpacity onPress={() => this.setState({ search_location: !search_location })} style={{ padding: 10 }}>
            <Icon name={search_location ? "times" : "search-location"} size={25} color={BaseColor.grayColor} />
          </TouchableOpacity>
        </View>
        <MapView
          style={styles.mapContainer}
          ref={(ref) => this.mapRef = ref}
          showsCompass={false}
          compassStyle={{
            top: 10,
            right: 10,
          }}
          mapType={_MAPTYPE[mapType]}
          initialRegion={{
            latitude: pinLocation.latitude,
            longitude: pinLocation.longitude,
            latitudeDelta: .5,
            longitudeDelta: .5
          }}
          initialCamera={{
            center: pinLocation,
            heading: 0,
            pitch: 1,
            zoom: 10,
            altitude: 0,
          }}
          onPress={this.touchMap.bind(this)}
        >
          <Marker coordinate={pinLocation}>
            {!this.params.viewable &&
              <ImageBackground source={Images.marker} resizeMode={'stretch'} style={styles.marker}>
                <Avatar user={user} defavatar size={22} />
              </ImageBackground>
            }
          </Marker>
        </MapView>
        <View style={{ width: "100%", padding: 10, flexDirection: "row", alignItems: "center", }}>
          <TouchableOpacity style={{ paddingHorizontal: 20 }} onPress={this.share.bind(this)}>
            <Icon name="share" size={30} color={BaseColor.primaryColor} type={"Feather"} />
          </TouchableOpacity>
          <ButtonGroup
            containerStyle={{ flex: 1 }}
            buttons={_MAPTYPE}
            selectedIndex={mapType}
            onPress={(mapType) => this.setState({ mapType })}
          />
          {!this.params.viewable &&
            <TouchableOpacity style={{ paddingHorizontal: 20 }} onPress={this.onConfirm.bind(this)}>
              <Icon name="check-circle" size={30} color={BaseColor.primaryColor} type={"Feather"} />
            </TouchableOpacity>
          }
        </View>
      </View>
    );
  }
}


const mapStateToProps = (state) => (state)
const mapDispatchToProps = { ...reduxActions }

export default connect(mapStateToProps, mapDispatchToProps)(CustomMapView);
