import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useAuthStore } from "@/store/authStore";
import { API_URL } from "@/constants/api";

import COLORS from "@/constants/colors";
import styles from "@/assets/styles/createTab.styles";

export default function Create() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { token, user } = useAuthStore();

  const uploadImage = async () => {
    try {
      //requesting permissions if needed
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission denied",
            "We need camera roll permissions to upload an image"
          );
          return;
        }
      }
      // launch the image library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5, //lower quality for smaller base64
        base64: true,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);

        // if base64 is provided use it
        if (result.assets[0].base64) {
          setImageBase64(result.assets[0].base64);
        } else {
          // convert it to base64
          const base64 = await FileSystem.readAsStringAsync(
            result.assets[0].uri,
            {
              encoding: FileSystem.EncodingType.Base64,
            }
          );
          setImageBase64(base64);
        }
      }
    } catch (error) {
      console.error("Error uploading image", error);
      Alert.alert("Error", "There was a problem uploading your image");
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !imageBase64) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      // get file extension from URI  or default tp jpeg
      const uriparts = image?.split(".");
      const fileType =
        uriparts && uriparts.length > 0
          ? uriparts[uriparts.length - 1]
          : undefined;
      const imageType = fileType
        ? `image/${fileType.toLowerCase()}`
        : "image/jpeg";

      const imageDataUrl = `data:${imageType};base64,${imageBase64}`;

      const response = await fetch(`${API_URL}/api/challenges`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          image: imageDataUrl,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong");

      Alert.alert("Success", "Your Challenge has been posted!");
      setTitle("");
      setDescription("");
      setImage(null);
      setImageBase64(null);
      router.push("/(tabs)/home");

      //
    } catch (error) {
      console.error("Error creating post:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.KeyboardAvoidingViewStyle}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        style={styles.scrollViewStyle}
      >
        <View style={styles.card}>
          <Text style={styles.username}>Welcome {user && user.name}</Text>
          {/* Header  */}
          <View style={styles.header}>
            <Text style={styles.title}>Post a friendly Challenge</Text>
            <Text style={styles.subtitle}>
              Share your favourite exercises with friends
            </Text>
          </View>
          {/* Form  */}
          <View style={styles.form}>
            {/* Challenge Image  */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Challenge Image</Text>
              <Pressable style={styles.imagePicker} onPress={uploadImage}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.previewImage} />
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Ionicons
                      name="images-sharp"
                      size={50}
                      color={COLORS.textSecondary}
                    />
                    <Text style={styles.placeholderText}>
                      Tap to upload an image
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>
            {/* Challenge title  */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Challenge Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="barbell-sharp"
                  size={20}
                  style={styles.inputIcon}
                  color={COLORS.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter a challenge name"
                  placeholderTextColor={COLORS.placeholderText}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
            </View>
            {/* Challenge Description  */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Challenge Description</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Explain the steps to complete the challenge"
                placeholderTextColor={COLORS.placeholderText}
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>
            {/* Sumbit Challenge button  */}
            <Pressable
              style={styles.button}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload-sharp"
                    size={20}
                    color={COLORS.white}
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>Share</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
