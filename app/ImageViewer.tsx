import React, { useState } from 'react';
import {
    View,
    Image,
    Modal,
    StyleSheet,
    Dimensions,
    StatusBar,
    TouchableOpacity,
} from 'react-native';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    runOnJS,
    withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DOUBLE_TAP_DELAY = 300;

const ImageViewer = ({ image }: { image: string }) => {
    const [modalVisible, setModalVisible] = useState(false);

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const lastTap = useSharedValue(0);
    const focalX = useSharedValue(0);
    const focalY = useSharedValue(0);

    const closeModal = () => {
        setModalVisible(false);
        translateY.value = 0;
        translateX.value = 0;
        scale.value = 1;
        savedScale.value = 1;
    };

    const pinchGesture = Gesture.Pinch()
        .onStart(() => {
            savedScale.value = scale.value;
        })
        .onUpdate((event) => {
            // Apply the new scale based on the saved scale value
            const newScale = savedScale.value * event.scale;
            scale.value = Math.min(Math.max(newScale, 0.5), 3);
            focalX.value = event.focalX;
            focalY.value = event.focalY;
        })
        .onEnd(() => {
            if (scale.value < 1) {
                scale.value = withSpring(1);
                savedScale.value = 1;
            } else {
                savedScale.value = scale.value;
            }
        });

    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .maxDuration(DOUBLE_TAP_DELAY)
        .onStart((event) => {
            if (scale.value > 1) {
                // If already zoomed in, reset to normal
                scale.value = withSpring(1);
                savedScale.value = 1;
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
            } else {
                // Zoom in to 2x at the tap location
                scale.value = withSpring(2);
                savedScale.value = 2;

                // Calculate the focal point for zooming
                const centerX = SCREEN_WIDTH / 2;
                const centerY = SCREEN_HEIGHT / 2;
                const focusX = event.x - centerX;
                const focusY = event.y - centerY;

                // Adjust translation to zoom into the tapped point
                translateX.value = withSpring(-focusX);
                translateY.value = withSpring(-focusY);
            }
        });

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            if (scale.value > 1) {
                // When zoomed in, allow panning within bounds
                translateX.value = event.translationX;
                translateY.value = event.translationY;
            } else {
                // Normal swipe behavior when not zoomed
                if (Math.abs(event.translationY) > Math.abs(event.translationX)) {
                    translateY.value = event.translationY;
                    scale.value = Math.max(0.8, 1 - Math.abs(event.translationY) / SCREEN_HEIGHT);
                }
            }
        })
        .onEnd((event) => {
            if (scale.value <= 1) {
                if (Math.abs(event.translationY) > SCREEN_HEIGHT * 0.2) {
                    runOnJS(closeModal)();
                }
            }

            // Reset position if not zoomed
            if (scale.value <= 1) {
                translateX.value = 0;
                translateY.value = withSpring(0);
                scale.value = withSpring(1);
                savedScale.value = 1;
            } else {
                // When zoomed, bound the pan values
                const maxTranslateX = (scale.value - 1) * SCREEN_WIDTH / 2;
                const maxTranslateY = (scale.value - 1) * SCREEN_HEIGHT / 2;

                translateX.value = withSpring(Math.min(Math.max(translateX.value, -maxTranslateX), maxTranslateX));
                translateY.value = withSpring(Math.min(Math.max(translateY.value, -maxTranslateY), maxTranslateY));
            }
        });

    const composedGesture = Gesture.Race(
        doubleTapGesture,
        Gesture.Simultaneous(pinchGesture, panGesture)
    );

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scale: scale.value },
            ],
        };
    });

    return (
        <View style={styles.container}>
            {/* Fullscreen modal */}
            <Modal visible={modalVisible} transparent={true} animationType="fade">
                <GestureHandlerRootView style={styles.modalContainer}>
                    <StatusBar hidden />
                    <GestureDetector gesture={composedGesture}>
                        <Animated.View style={[styles.modalContent, animatedStyle]}>
                            <Image
                                source={{ uri: image }}
                                style={styles.fullImage}
                                resizeMode="contain"
                            />
                        </Animated.View>
                    </GestureDetector>
                </GestureHandlerRootView>
            </Modal>

            {/* Image Thumbnail to trigger modal */}
            <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Image
                    source={{ uri: image }}
                    style={styles.thumbnailImage}
                    resizeMode="contain"
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'black',
    },
    modalContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    thumbnailImage: {
        width: 200,
        height: 200,
        margin: 20,
    },
});

export default ImageViewer;
