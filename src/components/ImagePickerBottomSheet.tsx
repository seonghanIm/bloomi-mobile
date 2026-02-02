import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface ImagePickerBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
}

export default function ImagePickerBottomSheet({
  visible,
  onClose,
  onCamera,
  onGallery,
}: ImagePickerBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleCamera = () => {
    onClose();
    setTimeout(() => onCamera(), 300);
  };

  const handleGallery = () => {
    onClose();
    setTimeout(() => onGallery(), 300);
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.wrapper}>
        {/* Overlay */}
        <Animated.View
          style={[styles.overlay, { opacity: fadeAnim }]}
        >
          <TouchableOpacity
            style={styles.overlayTouch}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.container,
            {
              paddingBottom: insets.bottom + 24,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Options */}
          <TouchableOpacity style={styles.option} onPress={handleCamera}>
            <Text style={styles.optionText}>카메라로 촬영</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={handleGallery}>
            <Text style={styles.optionText}>사진첩에서 선택</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouch: {
    flex: 1,
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 12,
    paddingHorizontal: 24,
  },
  handleBar: {
    width: 36,
    height: 4,
    backgroundColor: '#D1D1D6',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  option: {
    paddingVertical: 16,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
  },
});