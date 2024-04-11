import React, { useEffect, useState } from "react";
import { shareAsync } from "expo-sharing";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { IconButton } from "react-native-paper";
import { Button, Icon, Text, Card } from "@ui-kitten/components"
import * as MediaLibrary from "expo-media-library";
import { AZURE_API_KEY } from "@env";
import { receiptAnalyzedUpload } from "../../hooks/receiptAnalyzedUpload";
import { useFirestore } from "../../hooks/useFirestore";
import LoadingIndicator from "../../components/LoadingIndicator";

const Scanner = ({navigation}:any) => {
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState<
    boolean | undefined
  >(undefined);
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | undefined
  >(undefined);
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const { getReceiptById } = useFirestore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const cameraPermission =
        await ImagePicker.requestCameraPermissionsAsync();
      const mediaLibraryPermission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasCameraPermission(cameraPermission.status === "granted");
      setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted");
    })();
  }, []);

 
  const { extractDetails } = receiptAnalyzedUpload();
  
  async function waitForAnalysisCompletion(
    operationLocation: string,
    apiKey: string
  ) {
    let result = null;
    let status = "running";

    while (status !== "succeeded") {
      const operationResponse = await fetch(operationLocation, {
        method: "GET",
        headers: {
          "Ocp-Apim-Subscription-Key": apiKey,
        },
      });

      if (!operationResponse.ok) {
        console.error(`HTTP error! status: ${operationResponse.status}`);
        setIsLoading(false);
        break;
      }

      result = await operationResponse.json();
      status = result.status;

      if (status === "succeeded") {
        console.log("Analysis succeeded:", JSON.parse(JSON.stringify(result)));
        try {
          const receiptId = await extractDetails(result);
          navigation.navigate("Select Items", {
            receiptId: receiptId,
          });
        } catch (error) {
          console.error("Error:", error);
        }
        setIsLoading(false);
        break;
      } else if (status === "failed") {
        setIsLoading(false);
        console.error("Analysis failed:", JSON.stringify(result));
        break;
      } else {
        console.log("Analysis is still running, waiting before next check...");
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }
    }
  }
  const UploadImage = async () => {
    if (photo) {
      const endPoint = "https://splitit.cognitiveservices.azure.com/";
      const apiKey = AZURE_API_KEY;
      const modelId = "prebuilt-receipt";
      const apiVersion = "2023-07-31";
      const url = `${endPoint}formrecognizer/documentModels/${modelId}:analyze?api-version=${apiVersion}`;
      setIsLoading(true)
      
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": apiKey,
          },
          body: JSON.stringify({
            base64Source: photo.base64,
          }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const operationLocation = response.headers.get("Operation-Location");
        if (operationLocation) {
          waitForAnalysisCompletion(operationLocation, apiKey).catch(
            console.error
          );
        }
      } catch (error) {
        setIsLoading(false);
        console.error("Error during document analysis:", error);
      }
    }
  };
  const takePicture = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      cameraType: ImagePicker.CameraType.back,
      // quality: 1,
      base64: true,
    });
    if (!result.canceled) {
      if (result.assets && result.assets.length > 0) {
        console.log("Result:", result.assets[0].base64)
        setPhoto(
          result.assets && result.assets.length > 0 ? result.assets[0] : null
        );
      }
    }
  };
  const choosePicture = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      // allowsEditing: false,
      // quality: 1,
      base64: true,
    });
    if (!result.canceled) {
      if (result.assets && result.assets.length > 0) {
        setPhoto(
          result.assets && result.assets.length > 0 ? result.assets[0] : null
        );
      }
    }
  };

  const sharePic = () => {
    if (photo) {
      shareAsync(photo.uri);
    }
  };

  const savePhoto = () => {
    if (photo) {
      MediaLibrary.saveToLibraryAsync(photo.uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {photo ? (
        <>
          <Image
            style={styles.preview}
            source={{ uri: `data:image/jpg;base64,${photo?.base64}` }}
          />
          <View style={styles.buttonContainer}>
            {hasMediaLibraryPermission && (
              <TouchableOpacity style={styles.button} onPress={savePhoto}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={isLoading ? styles.buttonInactive : styles.button}
              onPress={UploadImage}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Upload</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setPhoto(null)}
            >
              <Text style={styles.buttonText}>Exit</Text>
            </TouchableOpacity>
          </View>
          <LoadingIndicator isLoading={isLoading} />
        </>
      ) : (  
        <View style={styles.optionContainer}>
          <Card>
          <Text category='h4' style={styles.header}>
            Upload Receipt
          </Text>
          <View style={styles.iconContainer}>
            <Button
              style={styles.iconButton}
              accessoryLeft={
                <Icon
                  name="camera"
                  fill="#ffffff"
                />
              }
              onPress={takePicture}
            >
              TAKE PICTURE
            </Button>
            <Button
              style={styles.iconButton}
              accessoryLeft={
                 <Icon
                  name="folder"
                  fill="#ffffff"
                />
              }
              onPress={choosePicture}
            >
              CHOOSE PICTURE
            </Button>
          </View>
          </Card>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  captureButton: {
    alignSelf: "flex-end",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    width: 72, // Adjust the button size as needed
    height: 72, // Adjust the button size as needed
    borderRadius: 36, // Make it a circle
    borderWidth: 2,
    borderColor: "white",
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },
  cameraButton: {
    alignSelf: "flex-end",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  container: {
    flex: 1,
    flexDirection: "column",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
  },
  button: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 20,
  },
  buttonInactive: {
    backgroundColor: "#b0b0b0",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#b0b0b0",
    borderRadius: 20,
  },
  buttonText: {
    color: "black",
  },
  preview: {
    flex: 1,
    resizeMode: "cover",
  },
  flex1: {
    flex: 1,
  },
  optionContainer: {
    flex: 1,
    margin: 40
  },
  header: {
    alignSelf: "center"
  },
  iconContainer: {
    marginVertical: 10,
    marginTop: 50
  },
  iconButton: {
    width: "100%",
    marginTop: 20
  },
  iconText: {
    textAlign: "center",
    color: "white",
    marginTop: 10,
  }
});

export default Scanner;
