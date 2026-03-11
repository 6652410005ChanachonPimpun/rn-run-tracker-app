import { Ionicons } from "@expo/vector-icons";
import { decode } from "base64-arraybuffer";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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
import { supabase } from "../service/supabase";

export default function Add() {
  const router = useRouter();
  //สร้าง state เพื่อจัดการกับข้อมูล
  const [location, setLocation] = useState("");
  const [distance, setDistance] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("เช้า");
  const [image, setImage] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);

  //ฟังก์ชันเปิดกล้องถ่ายภาพ หรือเลือกจากแกลเลอรี่
  const handleTakePhoto = async () => {
    //ขออนุญาตเข้าถึงกล้อง
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("ขออนุญาตเข้าถึงกล้องเพื่อถ่ายภาพหน่อยนะคร๊าบบบบบ");
      return;
    }

    //เปิดกล้องเพื่อถ่ายภาพ
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    //หลักจากถ่ายเรียยบร้อยแล้ว เอาไปกับ state ที่เตรียมไว้
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setBase64Image(result.assets[0].base64 || null);
    }
  };

  //บันทึกข้อมูลที่ป้อนไป supabase
  const handleSaveToSupabase = async () => {
    //validate location, distance, image
    if (!location || !distance || !image) {
      Alert.alert("คำเตือน", "กรุณาป้อนข้อมูลให้ครบ และเลือกรูปภาพด้วย");
      return;
    }

    //อัพโหลดรูปไปยัง storage ใน supabase
    let image_url = null; //ตัวแปรเก็บ url รูป
    const fileName = `img_${Date.now()}.jpg`; // ตั้งชื่อไฟล์ที่จะอัพโหลด
    const { error: uploadError } = await supabase.storage
      .from('run_bk')
      .upload(fileName, decode(base64Image!), {
        contentType: "image/jpeg",
      });

    if(uploadError) throw uploadError; //ตรวจสอบการอัพโหลด
  //เอา url ของรูปที่ storage มากำหนดให้กับตัวแปรเพื่อเอาไปลงตาราง
  image_url = await supabase.storage
    .from('run_bk')
    .getPublicUrl(fileName)
    .data.publicUrl;
    //บันทึกข้อมูลไปยัง table->database ของ supabase
    const { error: insertError } = await supabase.from("runs").insert([{
      location: location,
      distance: distance,
      time_of_day: timeOfDay,
      run_date: new Date().toISOString(). split("T")[0], // เอาแค่ ปี เดือน วัน
      image_url: image_url
    },
  ]);
    if (insertError) {
      Alert.alert("คำเตือน", "พบปัญหาในการบันทึกข้อมูล กรุณาลองใหม่");
      return;
    }
    //บันทึกเรียบร้อย แสดงข้อความแจ้ง และกลับไปหน้าหลัก
    Alert.alert("สําเร็จ", "ข้อมูลถูกบันทึกเรียบร้อยแล้ว");
    router.back()
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* ป้อนสถานที่วิ่ง */}
        <Text style={styles.titleShow}>สถานที่วิ่ง</Text>
        <TextInput
          placeholder="เช่น สวนลุมพินี"
          style={styles.inputValue}
          value={location}
          onChangeText={setLocation}
        />

        {/* ป้อนระยะทาง */}
        <Text style={styles.titleShow}>ระยะทาง (กิโลเมตร)</Text>
        <TextInput
          placeholder="เช่น 5.2"
          keyboardType="numeric"
          style={styles.inputValue}
          value={distance}
          onChangeText={setDistance}
        />

        {/* เลือกช่วงเวลา */}
        <Text style={styles.titleShow}>ช่วงเวลา</Text>
        <View style={{ flexDirection: "row", marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => setTimeOfDay("เช้า")}
            style={[
              styles.todBtn,
              { backgroundColor: timeOfDay === "เช้า" ? "#1889da" : "#b6b6b6" },
            ]}
          >
            <Text style={{ fontFamily: "Kanit_400Regular", color: "#fff" }}>
              เช้า
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTimeOfDay("เย็น")}
            style={[
              styles.todBtn,
              { backgroundColor: timeOfDay === "เย็น" ? "#1889da" : "#b6b6b6" },
            ]}
          >
            <Text style={{ fontFamily: "Kanit_400Regular", color: "#fff" }}>
              เย็น
            </Text>
          </TouchableOpacity>
        </View>

        {/* ปุ่มเปิดกล้องถ่ายภาพ */}
        <Text style={styles.titleShow}>รูปภาพสถานที่</Text>
        <TouchableOpacity style={styles.takePhotoBtn} onPress={handleTakePhoto}>
          {image ? (
            <Image
              source={{ uri: image }}
              style={{ width: "100%", height: 200 }}
            />
          ) : (
            <View style={{ alignItems: "center" }}>
              <Ionicons name="camera-outline" size={30} color="#b6b6b6" />
              <Text
                style={{ fontFamily: "Kanit_400Regular", color: "#b6b6b6" }}
              >
                กดเพื่อถ่ายภาพ
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* ปุ่มบันทึก */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveToSupabase}>
          <Text style={{ fontFamily: "Kanit_700Bold", color: "#fff" }}>
            บันทึกข้อมูล
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  todBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  saveBtn: {
    padding: 15,
    backgroundColor: "#1889da",
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  takePhotoBtn: {
    width: "100%",
    height: 200,
    backgroundColor: "#e6e6e6",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  inputValue: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    fontFamily: "Kanit_400Regular",
    backgroundColor: "#EFEFEF",
  },
  titleShow: {
    fontFamily: "Kanit_700Bold",
    marginBottom: 10,
  },
});