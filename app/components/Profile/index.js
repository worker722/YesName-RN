import { Avatar, Header, Profile1, Text } from "@components";
import { Images } from "@config";
import { image_uri } from "@utils";
import React, { Component } from "react";
import { ImageBackground, View } from "react-native";
import styles from "./styles";

export default class index extends Component {
    render() {
        const { user, security, profile_type, onGoBack, onPressAvatar } = this.props;
        return (
            <>
                {profile_type == 0 ?
                    <Header leftBack
                        onPressLeft={onGoBack}
                        security={security}
                        title={user.name}
                        renderRight={<Avatar user={user} size={45} onPress={onPressAvatar}/>}
                        OnPressRight={onPressAvatar}
                        onPressName={onPressAvatar}
                    />
                    :
                    profile_type == 1 ?
                        <Profile1
                            user={user}
                            show_header={false}
                            show_state={false}
                            security={security}
                            onPress={onPressAvatar}
                            onBackPress={onGoBack}
                        />
                        :
                        <View style={{ flex: 1 }}>
                            <ImageBackground resizeMode={'contain'} source={image_uri(user.avatar)} style={{ flex: 1 }} />
                            <ImageBackground
                                source={security ? Images.profile_name_back : Images.profile_name_back}
                                resizeMode={"stretch"}
                                style={styles.profile_name}>
                                <Text title2 primaryColor>{user.name}</Text>
                            </ImageBackground>
                        </View>
                }
            </>
        )
    }
}
