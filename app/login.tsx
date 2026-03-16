import { supabase } from "@/service/supabase";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

WebBrowser.maybeCompleteAuthSession();

const logo = require("@/assets/images/run.png");

export default function Login() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const redirectUrl = Linking.createURL("/");

      const sub = Linking.addEventListener("url", async ({ url }) => {
        sub.remove();
        WebBrowser.dismissBrowser();

        // เปลี่ยนจาก split("?") เป็น split("#")
        const params = new URLSearchParams(url.split("#")[1] ?? "");
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          router.replace("/run");
        } else {
          Alert.alert("เกิดข้อผิดพลาด", "ไม่พบ token");
        }
        setLoading(false);
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectUrl },
      });

      if (error) throw error;
      if (data?.url) await WebBrowser.openBrowserAsync(data.url);

    } catch (e) {
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถเข้าสู่ระบบได้");
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* กล่อง login */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>ล็อกอินด้วย</Text>
        <TouchableOpacity
          style={[styles.googleButton, loading && styles.buttonDisabled]}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#444" />
          ) : (
            <>
              <Image
                source={{ uri: "https://www.google.com/favicon.ico" }}
                style={styles.googleIcon}
              />
              <Text style={styles.googleButtonText}>เข้าสู่ระบบด้วย Google</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  title: {
    fontSize: 32,
    fontFamily: "Kanit_700Bold",
    color: "#0972af",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Kanit_400Regular",
    color: "#888",
    marginBottom: 40,
  },
  card: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Kanit_700Bold",
    color: "#333",
    marginBottom: 16,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  googleButtonText: {
    fontSize: 16,
    fontFamily: "Kanit_400Regular",
    color: "#444",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});