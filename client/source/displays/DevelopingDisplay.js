import React, { useEffect, useState, useRef } from "react";
import {
  View,
  ActivityIndicator,
  Animated,
  Text,
  PanResponder,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Sharing from "expo-sharing";
import DangerAlert from "../alerts/DangerAlert";
import CameraShotDisplay from "../displays/CameraShotDisplay";
import ButtonIconWithLabel from "../icons/ButtonIconWithLabel";
import { TRANSFER_CAMERA_SHOT } from "../utils/mutations/cameraMutations";
import { useMutation } from "@apollo/client";
import { cameraStyles } from "../styles/screens/cameraStyles";
import {
  containerStyles,
  headerStyles,
  layoutStyles,
  symbolStyles,
} from "../styles/components";
import { useCameraRoll } from "../contexts/CameraRollContext";
import ButtonIcon from "../icons/ButtonIcon";
import * as FileSystem from "expo-file-system";
import { useDevelopingRoll } from "../contexts/DevelopingRollContext";
import { useAdminProfile } from "../contexts/AdminProfileContext";

const threshold = 75; // Drag distance threshold

export default function DevelopingDisplay() {
  const navigation = useNavigation();
  const route = useRoute();
  const { shot } = route.params;
  console.log("SHOT");
  console.log(shot);
  console.log(shot._id);

  const { addMoment } = useAdminProfile();
  const { developingShots, removeShot } = useDevelopingRoll();
  const { addShotToRoll, removeShotFromRoll, shots } = useCameraRoll();

  // Apollo Mutation for transferring the shot
  const [transferCameraShot] = useMutation(TRANSFER_CAMERA_SHOT);

  const [isDeleteAlertVisible, setIsDeleteAlertVisible] = useState(false);
  const [isAdditionalOptionsVisible, setIsAdditionalOptionsVisible] =
    useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isPostingToMoment, setIsPostingToMoment] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pan = useRef(new Animated.ValueXY()).current;

  // === Header Configuration with Date and Time ===
  useEffect(() => {
    const date = new Date(shot?.capturedAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const time = new Date(shot?.capturedAt).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    navigation.setOptions({
      headerShown: true,
      headerTitle: () => (
        <View style={headerStyles.titleContainer}>
          <Text style={headerStyles.dateText}>{date}</Text>
          <Text style={headerStyles.timeText}>{time}</Text>
        </View>
      ),
      headerLeft: () => (
        <View style={headerStyles.headerLeft}>
          <ButtonIcon
            name="xmark"
            onPress={() => navigation.goBack()}
            style={symbolStyles.xmark}
          />
        </View>
      ),
      headerRight: () => (
        <View style={headerStyles.headerRight}>
          <ButtonIcon
            name="trash"
            onPress={handleDeletePress}
            tintColor="#E53935"
            style={symbolStyles.trash}
          />
        </View>
      ),
    });
  }, [shot, navigation, handleDeletePress]);

  // === Fade In Animation ===
  useEffect(() => {
    if (shot?.image || shot?.imageThumbnail) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [shot]);

  // Configure PanResponder for drag gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > threshold) {
          navigation.goBack();
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // === Transfer Shot to Camera Roll on Load ===
  useEffect(() => {
    const transferShot = async () => {
      try {
        // Check if the shot still exists in DevelopingRoll before transferring
        const shotExists = developingShots.some((s) => s._id === shot._id);
        if (!shotExists) return; // Skip if the shot has been deleted

        // Check if the shot already exists in Camera Roll
        const existingShot = shots.find((s) => s._id === shot._id);
        if (existingShot) return; // Prevent duplicate transfers

        await transferCameraShot({
          variables: { shotId: shot._id },
        });

        addShotToRoll({
          _id: shot._id,
          image: shot.image,
          imageThumbnail: shot.imageThumbnail,
          capturedAt: shot.capturedAt,
        });

        // Remove from DevelopingRoll
        removeShot(shot._id);
      } catch (error) {
        console.error("Error transferring shot:", error);
      }
    };

    if (shot) transferShot();
  }, [shot, transferCameraShot, addShotToRoll, developingShots, shots]);

  // === Actions ===
  const handleSharePress = async () => {
    if (!currentShot?.image) {
      alert("No image to share.");
      return;
    }

    try {
      let imageUri = currentShot.image;

      // If the image is a remote URL, download it to a local file
      if (imageUri.startsWith("http")) {
        const fileName = imageUri.split("/").pop();
        const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
        const { uri } = await FileSystem.downloadAsync(imageUri, fileUri);
        imageUri = uri;
      }

      // Check if sharing is available
      if (await Sharing.isAvailableAsync()) {
        // Share the local image file directly
        await Sharing.shareAsync(imageUri, {
          mimeType: "image/jpeg", // Specify the image MIME type
          dialogTitle: "Share Camera Shot",
          UTI: "public.jpeg", // UTI for image sharing
        });
      } else {
        alert("Sharing is not available on this device.");
      }
    } catch (error) {
      console.error("Error sharing image:", error);
      alert("Failed to share image.");
    }
  };

  const handlePostToMomentPress = () => {
    setIsPostingToMoment(true);
  };

  const handleExperiencePress = () => {
    navigation.navigate("AddToExperiences", {
      shotId: shot?._id,
      currentShot: {
        image: shot?.image,
        imageThumbnail: shot?.imageThumbnail,
      },
    });
  };

  const handleAlbumPress = () => {
    navigation.navigate("AddToAlbums", { shotId: shot?._id });
  };

  const handleConfirmPostToMoment = async () => {
    try {
      if (!shot._id) return;

      console.log("Calling addMoment with:", { cameraShotId: shot._id });
      // Use AdminProfileContext's addMoment
      await addMoment({ cameraShotId: shot._id });

      // Success feedback
      setFeedbackMessage("Moment successfully posted!");
    } catch (err) {
      console.error("Error posting moment:", err);
      setFeedbackMessage("Failed to post moment.");
    } finally {
      setTimeout(() => setFeedbackMessage(""), 2000);
      setIsPostingToMoment(false);
    }
  };

  const handleCancelPostToMoment = () => {
    setIsPostingToMoment(false);
  };

  const handleDeletePress = () => setIsDeleteAlertVisible(true);

  const confirmDelete = async () => {
    try {
      // Remove the shot from the Developing Roll
      const shotExists = developingShots.some((s) => s._id === shot._id);
      if (shotExists) {
        removeShot(shot._id);
      }

      // Remove the shot from the Camera Roll
      await removeShotFromRoll(shot._id);

      // Navigate back after deletion
      navigation.goBack();
    } catch (error) {
      console.error("Error deleting shot:", error);
      alert("Failed to delete shot.");
    } finally {
      setIsDeleteAlertVisible(false);
    }
  };

  const resetToMainButtons = () => {
    setIsAdditionalOptionsVisible(false);
    setIsPostingToMoment(false);
  };

  const handleAddToPress = () => setIsAdditionalOptionsVisible(true);

  // === Loading State ===
  if (!shot?.image && !shot?.imageThumbnail) {
    return (
      <View style={containerStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={containerStyles.loadingText}>Loading image...</Text>
      </View>
    );
  }

  // === Main Render ===
  return (
    <View style={layoutStyles.wrapper}>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          {
            transform: [{ translateX: pan.x }, { translateY: pan.y }],
          },
          { marginTop: 16 },
        ]}
      >
        <CameraShotDisplay
          shotId={shot._id}
          imageUrl={shot.image}
          developingImage={true}
        />
      </Animated.View>

      {feedbackMessage ? (
        <View style={cameraStyles.feedbackContainer}>
          <Text style={cameraStyles.feedbackText}>{feedbackMessage}</Text>
        </View>
      ) : (
        <View style={cameraStyles.bottomContainer}>
          {isPostingToMoment ? (
            <>
              <ButtonIconWithLabel
                iconName="checkmark"
                label="Confirm Moment"
                onPress={handleConfirmPostToMoment}
                style={{
                  height: 25,
                  width: 24.93,
                }}
              />
              <ButtonIconWithLabel
                iconName="xmark"
                label="Cancel"
                onPress={handleCancelPostToMoment}
                style={{
                  height: 23,
                  width: 22.49,
                }}
              />
            </>
          ) : isAdditionalOptionsVisible ? (
            <>
              <ButtonIconWithLabel
                iconName="folder"
                label="Album"
                onPress={handleAlbumPress}
                style={{
                  height: 20.02,
                  width: 25,
                }}
              />
              <ButtonIconWithLabel
                iconName="star"
                label="Experience"
                onPress={handleExperiencePress}
                style={{
                  height: 25.08,
                  width: 25,
                }}
              />
              <ButtonIconWithLabel
                iconName="arrow.left"
                label="Back"
                onPress={resetToMainButtons}
                style={{
                  height: 20.02,
                  width: 25,
                }}
              />
            </>
          ) : (
            <>
              <ButtonIconWithLabel
                iconName="paperplane"
                label="Share"
                onPress={handleSharePress}
                style={{
                  height: 23.74,
                  width: 24,
                  marginTop: 2,
                }}
              />
              <ButtonIconWithLabel
                iconName="rectangle.portrait.on.rectangle.portrait"
                label="Post Moment"
                onPress={handlePostToMomentPress}
                style={{
                  height: 25.5,
                  width: 21.14,
                }}
              />
              <ButtonIconWithLabel
                iconName="folder"
                label="Add To"
                onPress={handleAddToPress}
                style={{
                  height: 19.96,
                  width: 25,
                }}
              />
            </>
          )}
        </View>
      )}

      <DangerAlert
        visible={isDeleteAlertVisible}
        onRequestClose={() => setIsDeleteAlertVisible(false)}
        title="Delete Camera Shot"
        message="Are you sure you want to delete this shot?"
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteAlertVisible(false)}
        cancelButtonText="Discard"
      />
    </View>
  );
}
