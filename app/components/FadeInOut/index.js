import React, { Component } from "react";
import { Animated } from 'react-native';

export default class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opacity: new Animated.Value(props.isVisible ? 1 : 0)
        }
    }
    UNSAFE_componentWillReceiveProps(nextProps) {
        const isVisible = this.props.isVisible;
        const shouldBeVisible = nextProps.isVisible;

        if (isVisible && !shouldBeVisible) {
            Animated.timing(this.state.opacity, {
                toValue: 0,
                delay: 10,
                duration: 500,
                useNativeDriver: false
            }).start(this.onEndAnimation.bind(this));
        }

        if (!isVisible && shouldBeVisible) {
            Animated.timing(this.state.opacity, {
                toValue: 1,
                delay: 10,
                duration: 500,
                useNativeDriver: false
            }).start(this.onEndAnimation.bind(this));
        }
    }
    onEndAnimation() {
        try {
            this.props.onDone();
        } catch (error) { }
    }

    render() {
        return (
            <Animated.View
                pointerEvents={this.props.isVisible ? 'auto' : 'none'}
                style={[this.props.style, { opacity: this.state.opacity }]}>
                {this.props.children}
            </Animated.View>
        );
    }
};