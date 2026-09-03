import { ThemedText } from '@/components/themed-text';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const API_BASE_URL = 'http://119.59.102.161:3041/api';

export default function ProfileScreen() {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  
  const [userImg, setUserImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verified, setVerified] = useState(false);
  const [showPasswordFields, setShowPasswordFields] =
  useState(false);

  const [newPassword, setNewPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // 🟢 ดึง User ID และ Role จาก localStorage เมื่อเข้าหน้า
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId') || localStorage.getItem('user_id');
      console.log('LOCAL USER ID =', storedUserId);
      const storedRole =
        localStorage.getItem('role') ||
        (localStorage.getItem('username') === 'admin'
          ? 'admin'
          : 'staff');

      const storedEmail = localStorage.getItem('email');
      if (storedEmail) setEmail(storedEmail);

      setUserId(storedUserId);
      setUserRole(storedRole);

      if (storedUserId) {
        fetchProfile(storedUserId);
      } else {
        setLoading(false);
      }
    }
  }, []);

  // 🟢 ดึงข้อมูลโปรไฟล์จาก API
  const fetchProfile = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/profile/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        console.log('PROFILE DATA =', data);
        setUserName(data.user_name || data.username ||(typeof window !== 'undefined' ? localStorage.getItem('username') : '') || '');
        setEmail(data.email || '');
        setUserImg(
          data.profile_image ||
          data.user_img ||
          data.image ||
          null
        );
      } else {
        console.error('Fetch profile error:', data);
    }
   } catch (e) {
      showAlert('ข้อผิดพลาด', 'ดึงข้อมูลโปรไฟล์ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  // 🟢 บันทึกรูปภาพลงฐานข้อมูล
  const saveImageToDb = async (imgData: string) => {
    if (!userId) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/profile/${userId}/image`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_img: imgData }),
      });

      if (response.ok) {
        setUserImg(imgData);
        showAlert('สำเร็จ', 'อัปเดตรูปโปรไฟล์เรียบร้อยแล้ว');
      } else {
        const errorData = await response.json();

        showAlert(
          'ข้อผิดพลาด',
          errorData.error || 'อัปเดตรูปภาพไม่สำเร็จ'
        );
      }
    } catch (e) {
      showAlert('ข้อผิดพลาด', 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้');
    } finally {
      setSaving(false);
    }
  };

  const pickImageFromDevice = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      showAlert('แจ้งเตือน', 'กรุณายินยอมให้เข้าถึงคลังภาพ');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      await saveImageToDb(base64Image);
    }
  };

  // 🟢 ออกจากระบบ ลบข้อมูล localStorage
  const updateProfile = async () => {

  if (!userId) {
    showAlert('ผิดพลาด', 'ไม่พบ User ID');
    return;
  }

  try {

    const token = localStorage.getItem('token');

    const response = await fetch(
      `${API_BASE_URL}/profile/${userId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_name: userName,
          email: email,
          phone: null,
          password:
            showPasswordFields &&
            newPassword.trim() !== ''
            ? newPassword
            : undefined,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {

      setVerified(false);

      await fetchProfile(userId);

      showAlert(
        'สำเร็จ',
        'บันทึกข้อมูลเรียบร้อย'
      );

    } else {

      showAlert(
        'ผิดพลาด',
        data.error || 'อัปเดตไม่สำเร็จ'
      );

    }

  } catch (err) {

    showAlert(
      'ผิดพลาด',
      'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้'
    );

  }
};
  const handleLogout = () => {
    const doLogout = () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        localStorage.removeItem('user_id');
      }
      router.replace('/login');
    };

    if (Platform.OS === 'web') {
      if (window.confirm('ต้องการออกจากระบบใช่หรือไม่?')) doLogout();
    } else {
      Alert.alert('ออกจากระบบ', `ออกจากระบบ (${userName || 'ผู้ใช้'}) ใช่หรือไม่?`, [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ออกจากระบบ', style: 'destructive', onPress: doLogout },
      ]);
    }
  };

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#B4693E" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <ThemedText style={styles.backIcon}>
            ←
          </ThemedText>

          <ThemedText style={styles.backText}>
            ย้อนกลับ
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={() => {
                if (!verified) {
                  showAlert(
                    'แจ้งเตือน',
                    'กรุณากดยืนยันตัวตนก่อนแก้ไขรูปโปรไฟล์'
                  );
                  return;
                }

                pickImageFromDevice();
              }}
            >
              {userImg ? (
                <Image
                  source={{ uri: userImg }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <ThemedText style={styles.avatarLetter}>
                    {(userName ||
                      localStorage.getItem('username') ||
                      'U'
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </ThemedText>
                </View>
              )}

              {verified && (
                <View style={styles.cameraBadge}>
                  <ThemedText style={styles.cameraIcon}>
                    📷
                  </ThemedText>
                </View>
              )}
              </TouchableOpacity>

          <ThemedText style={styles.profileName}>
            {userName ||
              (typeof window !== 'undefined'
                ? localStorage.getItem('username')
                : '') ||
              'User'}
          </ThemedText>

          <ThemedText style={styles.profileRole}>
            {userRole?.toLowerCase() === 'admin'
              ? '👑 Admin'
              : '🧁 Staff'}
          </ThemedText>
        </View>

        <View style={styles.form}>

          <ThemedText style={styles.fieldLabel}>
            ชื่อผู้ใช้
          </ThemedText>

          {verified ? (
            <TextInput
              style={styles.inputBox}
              value={userName}
              onChangeText={setUserName}
            />
          ) : (
            <View style={styles.infoBox}>
              <ThemedText>
                {userName ||
                  localStorage.getItem('username') ||
                  '-'}
              </ThemedText>
            </View>
          )}

          <ThemedText style={styles.fieldLabel}>
            อีเมล
          </ThemedText>

            {verified ? (
              <TextInput
                style={styles.inputBox}
                value={email}
                onChangeText={setEmail}
              />
            ) : (
              <View style={styles.infoBox}>
                <ThemedText>
                  {email || (typeof window !== 'undefined' ? localStorage.getItem('email') : '') || '-'}
                </ThemedText>
              </View>
            )}


          {verified && (
            <TouchableOpacity
              style={styles.changePasswordBtn}
              onPress={() =>
                setShowPasswordFields(
                  !showPasswordFields
                )
              }
            >
              <ThemedText
                style={styles.changePasswordText}
              >
                🔒 เปลี่ยนรหัสผ่าน
              </ThemedText>
            </TouchableOpacity>
          )}

          {showPasswordFields && (
            <>
              <ThemedText style={styles.fieldLabel}>
                รหัสผ่านใหม่
              </ThemedText>

              <TextInput
                style={styles.inputBox}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />

              <ThemedText style={styles.fieldLabel}>
                ยืนยันรหัสผ่านใหม่
              </ThemedText>

              <TextInput
                style={styles.inputBox}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </>
          )}

          <TouchableOpacity
            style={[
              styles.saveBtn,
              verified && {
                backgroundColor: '#71C98C'
              }
            ]}
            onPress={async () => {
              if (verified) {

                if (
                  showPasswordFields &&
                  newPassword !== confirmPassword
                ) {
                  showAlert(
                    'ผิดพลาด',
                    'รหัสผ่านไม่ตรงกัน'
                  );
                  return;
                }

                updateProfile();

                return;
              }

              const password = window.prompt(
                'กรุณากรอกรหัสผ่านเพื่อยืนยันตัวตน'
              );

              if (!password) return;

              const token = localStorage.getItem('token');

              const response = await fetch(
                `${API_BASE_URL}/verify-password`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    password,
                  }),
                }
              );

              const data = await response.json();

              if (!response.ok) {
                showAlert(
                  'ผิดพลาด',
                  'รหัสผ่านไม่ถูกต้อง'
                );
                return;
              }

              if (!userName)
                setUserName(localStorage.getItem('username') || '');

              if (!email)
                setEmail(localStorage.getItem('email') || '');

              setVerified(true);


            }}
          >
            <ThemedText style={styles.btnText}>
              {verified
                ? '💾 บันทึกข้อมูล'
                : '🔐 แก้ไขข้อมูล'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
          >
            <ThemedText style={styles.logoutText}>
              ออกจากระบบ
            </ThemedText>
          </TouchableOpacity>

        </View>
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F1EB',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',

    backgroundColor: '#FFFDFB',

    paddingVertical: 8,
    paddingHorizontal: 14,

    borderRadius: 14,

    borderWidth: 1,
    borderColor: '#F2DDD1',

    gap: 6,
  },

  backIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D68AA0',
  },

  backText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D68AA0',
  },

  content: {
    padding: 24,
    paddingTop: 8,
    alignItems: 'center',
  },

  avatarWrapper: {
    marginBottom: 14,
  },

  avatarImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#F4C7D3',
  },

  form: {
    width: '100%',

    backgroundColor: '#FFFDFB',

    borderRadius: 24,

    borderWidth: 1,
    borderColor: '#F2DDD1',

    padding: 22,

    shadowColor: '#6B4A34',
    shadowOpacity: 0.05,
    shadowRadius: 12,

    elevation: 4,
  },

  saveBtn: {
    backgroundColor: '#F4A8B8',

    height: 52,

    borderRadius: 14,

    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 24,
  },

  logoutBtn: {
    backgroundColor: '#FFF0F0',

    height: 50,

    borderRadius: 14,

    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 14,

    borderWidth: 1,
    borderColor: '#FFD4D4',
  },

  logoutText: {
    color: '#E53935',
    fontWeight: '700',
  },

  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },

  profileName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#6B4A34',
    marginTop: 12,
  },

  profileRole: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D87495',
    marginTop: 4,
  },

btnText: {
  color: '#FFF',
  fontWeight: '700',
  fontSize: 14,
},

profileEmail: {
  marginTop: 8,
  fontSize: 14,
  color: '#8C6A52',
},

avatarContainer: {
  position: 'relative',
},

avatarFallback: {
  width: 110,
  height: 110,
  borderRadius: 55,

  backgroundColor: '#F4A8B8',

  justifyContent: 'center',
  alignItems: 'center',

  borderWidth: 4,
  borderColor: '#F4C7D3',
},

avatarLetter: {
  fontSize: 42,
  fontWeight: '800',
  color: '#FFF',
},

cameraBadge: {
  position: 'absolute',

  right: 0,
  bottom: 0,

  width: 34,
  height: 34,

  borderRadius: 17,

  backgroundColor: '#F4A8B8',

  justifyContent: 'center',
  alignItems: 'center',

  borderWidth: 3,
  borderColor: '#FFF',
},

cameraIcon: {
  fontSize: 33,
  marginTop: -15,
},

fieldLabel: {
  fontSize: 13,
  fontWeight: '700',
  color: '#8C6A52',
  marginTop: 14,
  marginBottom: 8,
},

infoBox: {
  backgroundColor: '#FFF8F4',
  borderWidth: 1,
  borderColor: '#EAD6C8',
  borderRadius: 14,
  paddingHorizontal: 16,
  paddingVertical: 14,
},

inputBox: {
  backgroundColor: '#FFF',
  borderWidth: 1,
  borderColor: '#F4A8B8',
  borderRadius: 14,
  paddingHorizontal: 16,
  paddingVertical: 14,
  fontSize: 14,
},

changePasswordBtn: {
  marginTop: 12,
},

changePasswordText: {
  color: '#D87495',
  fontWeight: '700',
},
});