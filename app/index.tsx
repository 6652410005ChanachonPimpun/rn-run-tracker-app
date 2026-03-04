import { router } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";

const logo = require("@/assets/images/run.png");

export default function Index() {
  //หน่วงเวลา 3 วิ
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/run");
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Image source={logo} style={{ width: 200, height: 200 }} />
      <Text style={{ fontSize: 24, fontFamily: "Kanit_700Bold" }}>
        Welcome to Run Tracker App!
      </Text>
      <Text
        style={{
          fontSize: 16,
          fontFamily: "Kanit_400Regular",
          marginBottom: 20,
        }}
      >
        Track your runs and stay motivated!
      </Text>
      <ActivityIndicator size="large" color="#0972af" />
    </View>
  );
}

const styles = StyleSheet.create({});
