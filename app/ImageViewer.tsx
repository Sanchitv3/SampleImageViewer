import React, { useState } from 'react';
import {
    View,
    Image,
    Modal,
    StyleSheet,
    Dimensions,
    StatusBar,
    TouchableOpacity,
    Platform,
    Pressable,
    Text,
} from 'react-native';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DOUBLE_TAP_DELAY = 300;

const isWeb = Platform.OS === 'web';

const ImageViewer = ({ Images, renderItems }: { Images: string[], renderItems: (image: string) => React.ReactNode }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const lastTap = useSharedValue(0);
    const focalX = useSharedValue(0);
    const focalY = useSharedValue(0);

    const closeModal = () => {
        // translateY.value = 0;
        // translateX.value = 0;
        // scale.value = 1;
        // savedScale.value = 1;
        setModalVisible(false);
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
            // When zoomed in, allow normal panning
            translateX.value = event.translationX;
            translateY.value = event.translationY;
          } else {
            // When not zoomed, handle horizontal swipes for navigation
            translateX.value = event.translationX;
            if (Math.abs(event.translationY) > Math.abs(event.translationX)) {
              translateY.value = event.translationY;
              scale.value = Math.max(0.5, 1 - Math.abs(event.translationY) / SCREEN_HEIGHT);
              console.log('scale value : ', scale.value);
            }
          }
        })
        .onEnd((event) => {
          if (scale.value <= 1) {
            if (Math.abs(event.translationY) > SCREEN_HEIGHT * 0.05) {
              runOnJS(closeModal)();
            } else if (Math.abs(event.translationX) > SCREEN_WIDTH * 0.2) {
              // Handle image navigation
              if (event.translationX > 0 && currentIndex > 0) {
                runOnJS(setCurrentIndex)(currentIndex - 1);
              } else if (event.translationX < 0 && currentIndex < Images.length - 1) {
                runOnJS(setCurrentIndex)(currentIndex + 1);
              }
            }
            translateX.value = withSpring(0);
            translateY.value = withSpring(0);
            scale.value = withSpring(1);
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

    console.log('current index : ', scale.value);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scale: scale.value }
            ],
            // backgroundColor: 'rgba(0, 0, 0, 0.7)',
        };
    });

    const animatedStyle2 = useAnimatedStyle(() => {
        return {
            opacity: scale.value,
        };
    });

    return (
        <View 
        // style={styles.container}
        >
            {/* Fullscreen modal */}
            <Modal visible={modalVisible} onRequestClose={closeModal} transparent={true} statusBarTranslucent>
            {/* {isWeb ? <Pressable onPress={closeModal} style={{ position: 'absolute', top: 11, right: 11 , padding: 10, zIndex: 1000, backgroundColor: "black", borderRadius: 100, width: 30, height: 30, justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', fontFamily: 'monospace'}}>x</Text>
                    </Pressable> : null} */}
                <Animated.View style={[{ flex: 1, backgroundColor: 'black'  }, animatedStyle2]}>
                <GestureHandlerRootView 
                // style={styles.modalContainer}
                >
                    <StatusBar hidden />
                    
                    <GestureDetector gesture={composedGesture}>
                        <Animated.View 
                        // style={[styles.modalContent, animatedStyle]}
                        style={[animatedStyle]}
                        >
                        {renderItems(Images[currentIndex])}
                        </Animated.View>
                    </GestureDetector>
                </GestureHandlerRootView>
                </Animated.View>
            </Modal>

            {/* Image Thumbnail to trigger modal */}
            <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Image
                    source={{ uri: Images[currentIndex] }}
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
        backgroundColor: 'red',
    },
    modalContainer: {
        flex: 1,
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
