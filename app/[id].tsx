import { supabase } from "@/service/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function RunDetail() {
  //ตัวแปรเก็บข้อมูลที่ส่งมา ณ ที่นี้คือ id ผ่าน useLocationSearchParams
  const { id } = useLocalSearchParams();

  //สร้าง state เก็บข้อมูลที่ดึงมาจากหน้าจอ supabase และใช้กับหน้าจอเพื่อให้ผู้ใช้ได้ปรับแก้
  const [location, setLocation] = useState("");
  const [distance, setDistance] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("เช้า");
  const [imageUrl, setImageUrl] = useState("");
  const [updating, setUpdating] = useState(false);
  const [newImageUri, setNewImageUri] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchRun();
  }, []);
  //สร้างฟังก์ชั่นดึงข้อมูลรายการวิ้งจาก supabase ตาม id ที่ส่งมา
  const fetchRun = async () => {
    const { data, error } = await supabase
      .from("runs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    setLocation(data.location);
    setDistance(data.distance.toString());
    setTimeOfDay(data.time_of_day);
    setImageUrl(data.image_url);
  };

  // ฟังก์ชั่นเลือกรูปใหม่
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("ไม่ได้รับสิทธิ์", "กรุณาอนุญาตให้เข้าถึงคลังรูปภาพ");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setNewImageUri(result.assets[0].uri); // แค่เก็บ uri ไว้ก่อน ยังไม่อัปโหลด
    }
  };

  // อัปโหลดรูปใหม่ขึ้น Supabase Storage และลบรูปเก่า
  const uploadNewImage = async (): Promise<string> => {
  if (!newImageUri) return imageUrl;

  setUploadingImage(true);
  try {
    const ext = newImageUri.split(".").pop()?.toLowerCase() ?? "jpg";
    const fileName = `run_${Date.now()}.${ext}`;
    const response = await fetch(newImageUri);
    const arrayBuffer = await response.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from("run_bk")
      .upload(fileName, arrayBuffer, {
        contentType: `image/${ext}`,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("run_bk")
      .getPublicUrl(fileName);

    // ลบรูปเก่า
    if (imageUrl) {
      const oldFileName = imageUrl.split("/").pop()!;
      await supabase.storage.from("run_bk").remove([oldFileName]);
    }

    return urlData.publicUrl;
  } finally {
    setUploadingImage(false);
  }
};

  //ฟังชั่นแก้ไข
  const handleUpdateRunClick = async () => {
    //ถามให้ชัวว่าจะแก้ไหม
    Alert.alert(
      "แก้ไขรายการวิ่ง",
      "คุณแน่ใจหรือไม่ว่าต้องการแก้ไขรายการวิ่งนี้",
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "แก้ไข", style: "destructive", onPress: async () => {
            if (!location || !distance) {
              Alert.alert("คำเตือน", "กรุณาป้อนข้อมูลให้ครบ และเลือกรูปภาพด้วย");
              return;
            }
            setUpdating(true);
            try {
              // อัปโหลดรูปใหม่ (ถ้ามี) และรับ URL กลับมา
              const finalImageUrl = await uploadNewImage();

              const { error: updateError } = await supabase
                .from("runs")
                .update({
                  location,
                  distance,
                  time_of_day: timeOfDay,
                  image_url: finalImageUrl, // อัปเดต url รูปด้วย
                })
                .eq("id", id);

              if (updateError) {
                Alert.alert("ผลการทำงาน", "แก้ไขรายการวิ่งไม่สําเร็จ");
                return;
              }

              Alert.alert("ผลการทำงาน", "แก้ไขรายการวิ่งเรียบร้อย");
              router.back();
            } catch (e) {
              Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถอัปโหลดรูปภาพได้");
            } finally {
              setUpdating(false);
            }
          }
        },
      ]
    );
  };

  //ฟังก์ชั่นลบ
  const handleDeleteRunClick = async () => {
    //ก่อนลบให้ถามก่อนว่าแน่ใจนะ
    await Alert.alert(
      "ลบรายการวิ่ง",
      "คุณแน่ใจหรือไม่ว่าต้องการลบรายการวิ่งนี้",
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ลบโลด", style: "destructive", onPress: async () => {
            //ลบข้อมูลออกจาก supabase
            const { error } = await supabase.from("runs").delete().eq("id", id);

            if (error) throw error;

            //ลบรูปออกจาก storage
            const { error: storageError } = await supabase.storage
              .from("run_bk")
              .remove([imageUrl.split("/").pop()!]);
            if (storageError) throw storageError;

            Alert.alert("ผลการทำงาน", "ลบรายการวิ่งเรียบร้อย");
            router.back();
          }
        },
      ]);
  };

  const displayImage = newImageUri ?? imageUrl;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ส่วนแสดงรูปภาพ */}
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={handlePickImage}
        activeOpacity={0.85}
      >
        {displayImage ? (
          <>
            <Image source={{ uri: displayImage }} style={styles.mainImage} resizeMode="cover" />
            {/* กดที่รูป เปลี่ยนรูปได้ */}
            <View style={styles.imageOverlay}>
              {uploadingImage
                ? <ActivityIndicator color="#FFF" size="large" />
                : (
                  <>
                    <Ionicons name="camera-outline" size={28} color="#FFF" />
                    <Text style={styles.overlayText}>
                      {newImageUri ? "รูปใหม่ (ยังไม่ได้บันทึก)" : "กดเพื่อเปลี่ยนรูป"}
                    </Text>
                  </>
                )
              }
            </View>
          </>
        ) : (
          <View style={[styles.mainImage, styles.noImage]}>
            <Ionicons name="camera-outline" size={60} color="#DDD" />
            <Text style={styles.noImageText}>กดเพื่อเพิ่มรูปภาพ</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* ฟอร์มแก้ไขข้อมูล */}
      <View style={styles.formCard}>
        <Text style={styles.label}>สถานที่</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
        />

        <Text style={styles.label}>ระยะทาง (กม.)</Text>
        <TextInput
          style={styles.input}
          value={distance}
          onChangeText={setDistance}
          keyboardType="numeric"
        />

        <Text style={styles.label}>ช่วงเวลา</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.chip, timeOfDay === 'เช้า' && styles.chipActive]}
            onPress={() => setTimeOfDay('เช้า')}
          >
            <Text style={[styles.chipText, timeOfDay === 'เช้า' && styles.chipTextActive]}>
              เช้า
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, timeOfDay === 'เย็น' && styles.chipActive]}
            onPress={() => setTimeOfDay('เย็น')}
          >
            <Text style={[styles.chipText, timeOfDay === 'เย็น' && styles.chipTextActive]}>
              เย็น
            </Text>
          </TouchableOpacity>
        </View>
        {/* ปุ่มแก้ไข */}
        <TouchableOpacity
          style={[styles.updateButton, updating && styles.buttonDisabled]}
          disabled={updating}
          onPress={handleUpdateRunClick}
        >
          {updating ?
            <ActivityIndicator color="#FFF" /> : <Text style={styles.updateButtonText}>บันทึกการแก้ไข</Text>}
        </TouchableOpacity>
        {/* ปุ่มลบ */}
        <TouchableOpacity style={styles.deleteButton}
          onPress={handleDeleteRunClick}>
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          <Text style={styles.deleteButtonText}>ลบรายการนี้</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingVertical: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  overlayText: { 
    color: '#FFF', 
    fontFamily: 'Kanit_400Regular', 
    fontSize: 14 
  },
  formCard: {
    backgroundColor: '#FFF', 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30,
    padding: 24, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 }, 
    shadowOpacity: 0.1,
    shadowRadius: 10, 
    elevation: 5,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingBottom: 40,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#EEE',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  noImageText: {
    fontFamily: 'Kanit_400Regular',
    color: '#AAA',
    marginTop: 10,
  },
  label: {
    fontFamily: 'Kanit_700Bold',
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
    textTransform: 'uppercase',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingVertical: 10,
    fontFamily: 'Kanit_400Regular',
    fontSize: 18,
    color: '#007AFF',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  chipActive: {
    backgroundColor: '#007AFF',
  },
  chipText: {
    fontFamily: 'Kanit_400Regular',
    color: '#666',
  },
  chipTextActive: {
    color: '#FFF',
  },
  updateButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  updateButtonText: {
    color: '#FFF',
    fontFamily: 'Kanit_700Bold',
    fontSize: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontFamily: 'Kanit_400Regular',
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
