import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

interface SideDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export default function SideDrawer({ visible, onClose }: SideDrawerProps) {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const slideAnim = useRef(new Animated.Value(300)).current; // 초기 위치: 오른쪽 밖

  useEffect(() => {
    if (visible) {
      // 열릴 때: 오른쪽에서 슬라이드 인
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // 닫힐 때: 오른쪽으로 슬라이드 아웃
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleLogout = async () => {
    onClose();
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.drawerOverlay}>
        <TouchableOpacity
          style={styles.drawerBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.drawerContent,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >

          <View style={[styles.drawerHeader, { paddingTop: insets.top + 24 }]}>
            <View style={styles.userInfo}>
              <Image
                source={{ uri: user?.picture }}
                style={styles.userAvatar}
              />
              <View>
                <Text style={styles.userName}>{user?.name}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeDrawerButton}
            >
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>


          <ScrollView style={styles.drawerMenu}>
            <TouchableOpacity
              style={styles.drawerMenuItem}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color="#666" />
              <Text style={styles.drawerMenuText}>로그아웃</Text>
            </TouchableOpacity>

          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerContent: {
    width: 280,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#F9F9F9',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E0E0E0',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: '#666',
  },
  closeDrawerButton: {
    padding: 4,
  },
  drawerMenu: {
    flex: 1,
    paddingTop: 8,
  },
  drawerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingHorizontal: 24,
    gap: 16,
  },
  drawerMenuText: {
    fontSize: 16,
    color: '#666',
  },
});
