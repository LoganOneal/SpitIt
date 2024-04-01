import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { IFirebaseUser } from "../../interfaces/IAuthentication";
import { auth } from "../../services/firebase";
import { useFirestore } from "../../hooks/useFirestore";
import { useFocusEffect } from "@react-navigation/native";

const SettingsScreen = ({ navigation }: any) => {
  const [profile, setProfile] = useState<IFirebaseUser | null>(null);
  const { getFirestoreUser } = useFirestore();

  useFocusEffect(
    React.useCallback(() => {
      const fetchProfile = async () => {
        const uid = auth.currentUser?.uid;

        const profileData = await getFirestoreUser(uid!);
        setProfile(profileData);
      };

      fetchProfile();
    }, [])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f6f6" }}>
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>

            <View style={styles.profile}>
              <Image
                source={
                  profile?.photoURL
                    ? { uri: profile.photoURL }
                    : require("../../../assets/images/defaultProfileImage.jpg")
                }
                style={styles.profileAvatar}
              />
              <Text style={styles.profileName}>{profile?.displayName}</Text>
              <Text style={styles.profileEmail}>{profile?.email}</Text>
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Settings</Text>
            <View style={styles.sectionBody}>
              <View style={styles.rowWrapper}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("EditProfile", {
                      profile: profile,
                    });
                  }}
                  style={styles.row}
                >
                  <Text style={styles.rowLabel}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.rowWrapper}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("EditProfilePassword");
                  }}
                  style={styles.row}
                >
                  <Text style={styles.rowLabel}>Change Password</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.rowWrapper}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("EditPaymentSettings", {
                      profile: profile,
                    });
                  }}
                  style={styles.row}
                >
                  <Text style={styles.rowLabel}>Edit Payment Settings</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.sectionTitle}>More</Text>
            <View style={styles.sectionBody}>
              <View style={styles.rowWrapper}>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>About</Text>
                </View>
              </View>
              <View style={styles.rowWrapper}>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Terms of Service</Text>
                </View>
              </View>
              <View style={styles.rowWrapper}>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Privacy Policy</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 0,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  header: {
    paddingLeft: 24,
    paddingRight: 24,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1d1d1d",
    marginBottom: 6,
  },
  /** Profile */
  profile: {
    padding: 16,
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e3e3e3",
  },
  profileAvatar: {
    width: 120, 
    height: 120, 
    borderRadius: 9999,
  },
  profileName: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: "600",
    color: "#090909",
  },
  profileEmail: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "400",
    color: "#848484",
  },
  section: {
    paddingTop: 12,
  },
  sectionTitle: {
    marginVertical: 8,
    marginHorizontal: 24,
    fontSize: 14,
    fontWeight: "600",
    color: "#a7a7a7",
    textTransform: "uppercase",
    justifyContent: "center",
    letterSpacing: 1.2,
  },
  sectionBody: {
    paddingLeft: 24,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e3e3e3",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingRight: 24,
    height: 50,
  },
  rowWrapper: {
    borderTopWidth: 1,
    borderColor: "#e3e3e3",
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: "500",
    color: "#000",
  },
});
