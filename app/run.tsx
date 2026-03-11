import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "../service/supabase";
import { Runstype } from "../types/runstype";

const runing = require("@/assets/images/run.png");

export default function Run() {
  //สร้าง state ที่ดึงมาจาก supabase
  const [runs, setRuns] = useState<Runstype[]>([]);

  //สร้างฟังก์ชั่นดึงข้อมูลรายการวิ่งจาก supabase
  const fetchRuns = async () => {
    const { data, error } = await supabase.from("runs").select("*");
    if (error) {
      Alert.alert('คำเตือน', 'เกิดข้อผิดพลาดในการดึงข้อมูล');
      return;
    }
    //กำหนดข้อมูลที่ดึงมาให้กับ state
    setRuns(data as Runstype[]);
  };

  //เรียกใช้ฟังก์ชั่นดึงข้อมูล
  useFocusEffect(
    useCallback(() => {
      fetchRuns();
    }, []),
  );

  //สร้างฟังก์ชั่นแสดงหน้าตาที่จะแสดงของแต่ละรายการที่ Flatlist
  const renderItem = ({ item }: { item: Runstype }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <Image
          source={{ uri: item.image_url }}
          style={styles.cardImage}
        />
        <View style={styles.distanceBadge}>
          <Text style={styles.locationText}>{item.location}</Text>
          <Text style={styles.dateText}>
            {(() => {
              const date = new Date(item.run_date);
              const buddhistYear = 'พ.ศ. ' + (date.getFullYear() + 543);
              return new Intl.DateTimeFormat('th-TH', {
                month: 'long',
                day: 'numeric',
              }).format(date) + ' ' + buddhistYear;
            })()}
          </Text>
        </View>
        <Text style={styles.distanceText}>{item.distance} km</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* ส่วนแสดงรูปบนสุด */}
      <Image source={runing} style={styles.imglogo} />
      {/* ส่วนแสดงข้อมูลที่ดึงมาจาก supabase */}
      <FlatList
        data={runs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listPadding}
      />
      {/* ปุ่มเพิ่มข้อมูลล่างซ้าย */}
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
  listPadding: {
    padding: 20,
    paddingBottom: 100, // เว้นที่ให้ FAB
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    // Shadow สำหรับ iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    // Elevation สำหรับ Android
    elevation: 3,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 10,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  distanceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  locationText: {
    fontFamily: 'Kanit_700Bold',
    fontSize: 18,
    color: '#333',
    marginBottom: 4,
  },
  dateText: {
    fontFamily: 'Kanit_400Regular',
    fontSize: 14,
    color: '#888',
  },
  distanceText: {
    fontFamily: 'Kanit_700Bold',
    fontSize: 14,
    color: '#007AFF',
  },
  imgShow: {
    width: 50,
    height: 50,
  },
  cardItem: {
    flex: 1,
    flexDirection: "row",
    margin: 5,
    width: '100%',
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#ffffff',
    padding: 10,
  },
  imglogo: {
    width: 100,
    height: 100,
    marginTop: 20,
    margin: 'auto',
  },
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
