import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

//เลือกรูปหรือถ่ายภาพ
const handletakePhoto = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    alert("ขออณุญาตเข้าถึงกล้องเพื่อถ่ายรูป");
    return;
  }
  // เปิดกล้องถ่ายรูป
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.5,
    base64: true,
  });

  // หลังจากถ่ายรูปเสร็จแล้ว เอาไปรับ state ที่เขียนไว้
  if (!result.canceled) {
    setImage(result.assets[0].uri);
    setBase64Image(result.assets[0].base64);
  }
};

export default function Add() {
  // สร้าง state สำหรับเก็บข้อมูลที่ผู้ใช้กรอก
  const [location, setLocation] = useState("");
  const [distance, setDistance] = useState("");
  const [timeofday, setTimeOfDay] = useState("เช้า");
  const [image, setImage] = useState<string | null>(null);
  const [base64image, setBase64Image] = useState<string | null>(null);

  return (
    <View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          <Text style={styles.titleshow}>สถานที่วิ่ง</Text>
          <TextInput
            placeholder="เฃ่น สวนลุมพินี"
            style={styles.textinput}
            value={location}
            onChangeText={setLocation}
          />
          <Text style={styles.titleshow}>ระยะทาง (กิโลเมตร)</Text>
          <TextInput
            placeholder="เช่น 5.1"
            keyboardType="numeric"
            style={styles.textinput}
            value={distance}
            onChangeText={setDistance}
          />
          <Text style={styles.titleshow}>ช่วงเวลา</Text>
          <View style={{ flexDirection: "row", marginBottom: 10 }}>
            <TouchableOpacity
              onPress={() => setTimeOfDay("เช้า")}
              style={[
                styles.todbtn,
                timeofday === "เช้า"
                  ? { backgroundColor: "#0972af" }
                  : { backgroundColor: "#ccc" },
              ]}
            >
              <Text
                style={{ fontFamily: "Kanit_400Regular", color: "#ffffff" }}
              >
                เช้า
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTimeOfDay("เย็น")}
              style={[
                styles.todbtn,
                timeofday === "เย็น"
                  ? { backgroundColor: "#0972af" }
                  : { backgroundColor: "#ccc" },
              ]}
            >
              <Text
                style={{ fontFamily: "Kanit_400Regular", color: "#ffffff" }}
              >
                เย็น
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.titleshow}>รูปตามสถานที่</Text>
          <TouchableOpacity
            style={styles.talePhotobtn}
            onPress={handletakePhoto}
          >
            {image ? (
              <Image
                source={{ uri: image }}
                style={{ width: "100%", height: 200 }}
              />
            ) : (
              <View>
                <Ionicons name="camera" size={40} color="#0972af" />
                <Text
                  style={{ fontFamily: "Kanit_400Regular", color: "#0972af" }}
                >
                  ถ่ายรูป
                </Text>
              </View>
            )}
          </TouchableOpacity>
          {/* ปุ่มบันทึก */}
          <TouchableOpacity style={styles.savebtn}>
            <Text style={{ fontFamily: "Kanit_400Regular", color: "#ffffff" }}>
              บันทึก
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  todbtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  savebtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#0972af",
    borderRadius: 5,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  talePhotobtn: {
    width: "100%",
    height: 200,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  titleshow: {
    fontSize: 20,
    fontFamily: "Kanit_700Bold",
    marginBottom: 10,
  },
  textinput: {
    fontFamily: "Kanit_400Regular",
    fontSize: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
  },
});
