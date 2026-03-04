import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Run() {
  return (
    <View style={styles.container}>
      <Text>Run</Text>

      <TouchableOpacity
        style={styles.floatingbtn}
        onPress={() => router.push("/add")}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingbtn: {
    padding: 10,
    backgroundColor: "#0972af",
    width: 50,
    height: 50,
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 60,
    right: 20,
    elevation: 10,
  },
});
