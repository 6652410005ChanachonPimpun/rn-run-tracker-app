import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";

const logo = require("@/assets/images/run.png");

export default function Index() {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (session) {
      router.replace("/run");
    } else {
      router.replace("/login");
    }
  }, [session, loading]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Image source={logo} style={{ width: 200, height: 200 }} />
      <Text style={{ fontSize: 24, fontFamily: "Kanit_700Bold" }}>
        Welcome to Run Tracker App!
      </Text>
      <Text style={{ fontSize: 16, fontFamily: "Kanit_400Regular", marginBottom: 20 }}>
        Track your runs and stay motivated!
      </Text>
      <ActivityIndicator size="large" color="#0972af" />
    </View>
  );
}