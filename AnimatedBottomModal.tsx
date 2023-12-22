import Modal from "react-native-modal";
import * as React from "react";
import { useRef, useState, useEffect, FC } from "react";
import {
  View,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PanResponder,
  Keyboard,
  EmitterSubscription,
} from "react-native";
import XIcon from "./XIcon";

interface AnimatedBottomModalProps {
  isVisible: boolean;
  onClose: () => void;
  backgroundColorModal?: string;
  backgroundColorCloseIcon?: string;
  closeIcon?: boolean;
  lineAbove?: boolean;
  children?: React.ReactNode;
}

const AnimatedBottomModal: FC<AnimatedBottomModalProps> = ({
  isVisible,
  onClose,
  backgroundColorModal = "white",
  backgroundColorCloseIcon = "white",
  closeIcon = true,
  lineAbove = true,
  children,
}) => {
  const styles = StyleSheet.create({
    closeIcon: {
      alignSelf: "flex-end",
      backgroundColor: backgroundColorCloseIcon,
      borderRadius: 12,
      height: 24,
      width: 24,
      justifyContent: "center",
      alignItems: "center",
    },
    line: {
      height: 5,
      width: 80,
      borderRadius: 5,
      backgroundColor: backgroundColorModal ?? "white",
      alignSelf: "center",
      marginBottom: 3,
    },
    contentWrapper: {
      height: 1300,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 16,
    },
  });

  const [heightContent, setHeightContent] = useState(0);
  const translateY = useRef(new Animated.Value(0)).current;
  const HEIGH = Dimensions.get("window").height;
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const keyboardDidShowListener = useRef<EmitterSubscription | undefined>(
    undefined
  );
  const keyboardDidHideListener = useRef<EmitterSubscription | undefined>(
    undefined
  );

  useEffect(() => {
    keyboardDidShowListener.current = Keyboard.addListener(
      "keyboardDidShow",
      _keyboardDidShow
    );
    keyboardDidHideListener.current = Keyboard.addListener(
      "keyboardDidHide",
      _keyboardDidHide
    );

    return () => {
      if (keyboardDidShowListener.current) {
        keyboardDidShowListener.current.remove();
      }
      if (keyboardDidHideListener.current) {
        keyboardDidHideListener.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    animateHeight(-heightContent);
  }, [isVisible]);

  useEffect(() => {
    animateHeight(-heightContent);
  }, [heightContent]);

  const animateHeight = (
    newHeight: number,
    callback?: () => void,
    duration = 300
  ) => {
    Animated.timing(translateY, {
      toValue: newHeight,
      duration: duration,
      useNativeDriver: true,
    }).start(({ finished }) => {
      finished && callback;
    });
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (e, gestureState) => {
      const { dy } = gestureState;
      if (dy < -20) {
        animateHeight(-heightContent - 20, () => {}, 0);
      } else {
        animateHeight(-heightContent + dy, () => {}, 0);
      }
    },

    onPanResponderRelease: (e, gestureState) => {
      if (gestureState.dy > 0 && gestureState.dy <= 40) {
        animateHeight(-heightContent, () => {}, 300);
      }
      if (gestureState.dy > 40) {
        closeModal();
      }
      if (gestureState.dy < 0) {
        animateHeight(-heightContent, () => {}, 300);
      }
    },
  });

  const _keyboardDidShow = (e) => {
    setKeyboardHeight(e.endCoordinates.height);
  };

  const _keyboardDidHide = (e) => {
    setKeyboardHeight(0);
  };

  const onBlockLayout = (event) => {
    const { height } = event.nativeEvent.layout;
    setHeightContent(height + 70);
  };

  const closeModal = () => {
    animateHeight(heightContent, onClose);
  };

  return (
    <Modal
      isVisible={isVisible}
      animationInTiming={300} // Указываем скорость анимации открытия
      animationOutTiming={300} // Указываем скорость анимации закрытия
      backdropTransitionInTiming={300} // Скорость появления фона
      backdropTransitionOutTiming={300} // Скорость исчезновения фона
      onBackdropPress={closeModal}
      backdropColor={"rgba(0, 0, 0, 0.3)"}
      style={{ justifyContent: "flex-end", margin: 0 }}
    >
      <Animated.View
        style={{
          width: "100%",
          position: "absolute",
          top: HEIGH,
          transform: [{ translateY: translateY }],
        }}
        {...panResponder.panHandlers}
      >
        {lineAbove && <View style={styles.line} />}
        <View
          style={[
            styles.contentWrapper,
            { backgroundColor: backgroundColorModal ?? "white" },
          ]}
        >
          <View onLayout={onBlockLayout}>
            {closeIcon && (
              <TouchableOpacity onPress={closeModal} style={styles.closeIcon}>
                <XIcon size={12} color={"black"} />
              </TouchableOpacity>
            )}
            <View>{children}</View>
            <View style={{ height: keyboardHeight }}></View>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

export default AnimatedBottomModal;
