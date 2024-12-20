import React, { useState } from 'react';
import {
  View,
  Image,
  Modal,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
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

const ImageViewer = ({ images }: { images: string[] }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  const closeModal = () => {
    setModalVisible(false);
    translateY.value = 0;
    translateX.value = 0;
    scale.value = 1;
  };

  const nextImage = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(prev => prev + 1);
      translateX.value = 0;
      scale.value = 1;
    }
  };

  const previousImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      translateX.value = 0;
      scale.value = 1;
    }
  };

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.min(Math.max(event.scale, 0.5), 3);
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
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
        } else {
          translateX.value = event.translationX;
        }
      }
    })
    .onEnd((event) => {
      if (scale.value <= 1) {
        if (Math.abs(event.translationY) > SCREEN_HEIGHT * 0.2) {
          runOnJS(closeModal)();
        } else if (Math.abs(event.translationX) > SCREEN_WIDTH * 0.3) {
          if (event.translationX > 0) {
            runOnJS(previousImage)();
          } else {
            runOnJS(nextImage)();
          }
        }
      }
      
      // Reset position if not zoomed
      if (scale.value <= 1) {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        scale.value = withSpring(1);
      } else {
        // When zoomed, bound the pan values
        const maxTranslateX = (scale.value - 1) * SCREEN_WIDTH / 2;
        const maxTranslateY = (scale.value - 1) * SCREEN_HEIGHT / 2;
        
        translateX.value = withSpring(Math.min(Math.max(translateX.value, -maxTranslateX), maxTranslateX));
        translateY.value = withSpring(Math.min(Math.max(translateY.value, -maxTranslateY), maxTranslateY));
      }
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  const renderPreviewImage = (offset: number) => {
    const previewIndex = currentIndex + offset;
    if (previewIndex < 0 || previewIndex >= images.length) return null;

    return (
      <Animated.View
        style={[
          styles.previewImage,
          {
            opacity: 0.3,
            transform: [
              { translateX: offset * (SCREEN_WIDTH + 50) },
              { scale: 0.8 },
            ],
          },
        ]}
      >
        <Image
          source={{ uri: images[previewIndex] }}
          style={styles.fullImage}
          resizeMode="contain"
        />
      </Animated.View>
    );
  };

  return (
    <View style={styles.container} className='flex-1 bg-black'>
      {/* Thumbnail grid */}
      <View style={styles.grid}>
        {images.map((image: string, index: number) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              setCurrentIndex(index);
              setModalVisible(true);
            }}
            className='w-[100px] h-[100px] bg-red-500'
          >
            <Image source={{ uri: image }} className='w-[100px] h-[100px]' />
          </TouchableOpacity>
        ))}
      </View>

      {/* Fullscreen modal */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <GestureHandlerRootView style={styles.modalContainer}>
          <StatusBar hidden />
          {/* Preview images */}
          {renderPreviewImage(-1)}
          {renderPreviewImage(1)}
          
          <GestureDetector gesture={composedGesture}>
            <Animated.View style={[styles.modalContent, animatedStyle]}>
              <Image
                source={{ uri: images[currentIndex] }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            </Animated.View>
          </GestureDetector>
        </GestureHandlerRootView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 2,
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
  previewImage: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ImageViewer;