import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showSuccessModal, setShowSuccessModal] =
    useState(false);

  const showAlert = (
    title: string,
    message: string
  ) => {
    if (typeof window !== 'undefined') {
      alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setProfileImage(
          `data:image/jpeg;base64,${result.assets[0].base64}`
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRegister = async () => {
    setEmailError('');
    setUsernameError('');
    setPasswordError('');

// เช็กว่ากรอกข้อมูลครบไหม
if (!username) {
  setUsernameError('Username is required.');
}

if (!email) {
  setEmailError('Email is required.');
}

if (!password) {
  setPasswordError('Password is required.');
}

if (!username || !email || !password) {
  return;
}

// ตรวจสอบรูปแบบ Email
// ตัวอย่าง:
// abc@gmail.com
// test@hotmail.com
const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ถ้า Email ไม่ถูกต้อง
if (!emailRegex.test(email)) {
  setEmailError(
    'Please enter a valid email address.'
  );
  return;
}

// ตรวจสอบว่า Username ต้องมีอย่างน้อย 3 ตัวอักษร
if (username.trim().length < 3) {
  setUsernameError(
    'Username must contain at least 3 characters.'
  );
  return;
}

// ตรวจสอบว่ารหัสผ่านและยืนยันรหัสผ่านตรงกันหรือไม่
if (password !== confirmPassword) {
  setPasswordError(
    'Password and Confirm Password do not match.'
  );
  return;
}

    try {
      const response = await fetch(
        'http://119.59.102.161:3041/api/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            email,
            password,
            profile_image: profileImage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {

        if (data.error === 'Email already exists') {
          setEmailError(
            'Email already exists.'
          );
          return;
        }

        if (data.error === 'Username already exists') {
          setUsernameError(
            'Username already exists.'
          );
          return;
        }

        showAlert(
          'Sign-up failed',
          data.error || 'An error occurred'
        );
        return;
      }
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error(error);

      showAlert(
        'Error',
        'Can not connect to the server'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          🧁 Register
        </Text>

        <View style={styles.avatarSection}>
          {profileImage ? (
            <Image
              source={{ uri: profileImage }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarLetter}>
                {(username || 'U')
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.pickImageButton}
            onPress={handlePickImage}
          >
            <Text style={styles.pickImageText}>
              📷 Upload Photo
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>
          Username
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter username"
          value={username}
          onChangeText={setUsername}
        />

        {usernameError ? (
          <Text style={styles.errorText}>
            {usernameError}
          </Text>
        ) : null}

        <Text style={styles.label}>
          Email
        </Text>

        <TextInput
          style={styles.input}
          placeholder="example@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {emailError ? (
          <Text style={styles.errorText}>
            {emailError}
          </Text>
        ) : null}

        <Text style={styles.label}>
          Password
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.label}>
          Confirm password
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {passwordError ? (
          <Text style={styles.errorText}>
            {passwordError}
          </Text>
        ) : null}

        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
        >
          <Text style={styles.buttonText}>
            Sign up
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace('/login')}
        >
          <Text style={styles.loginText}>
            Already have an account? Log in
          </Text>
        </TouchableOpacity>
      </View>
      <Modal
  visible={showSuccessModal}
  transparent
  animationType="fade"
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalCard}>

      <Text style={styles.successIcon}>
        ✅
      </Text>

      <Text style={styles.modalTitle}>
        Registration Successful
      </Text>

      <Text style={styles.modalMessage}>
        Your account has been created successfully.
      </Text>

      <TouchableOpacity
        style={styles.modalButton}
        onPress={() => {
          setShowSuccessModal(false);
          router.replace('/login');
        }}
      >
        <Text style={styles.modalButtonText}>
          Continue to Login
        </Text>
      </TouchableOpacity>

    </View>
  </View>
</Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#F8F1EB',
  },

  card: {
    backgroundColor: '#FFFDFB',
    borderRadius: 30,

    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,

    borderWidth: 1,
    borderColor: '#F2DDD1',

    shadowColor: '#6B4A34',
    shadowOpacity: 0.06,
    shadowRadius: 16,

    elevation: 4,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    color: '#6B4A34',

    marginBottom: 20,
  },

  avatarSection: {
    alignItems: 'center',

    marginBottom: 24,
  },

  avatarPlaceholder: {
    width: 86,
    height: 86,
    borderRadius: 43,

    backgroundColor: '#FBEAF0',

    borderWidth: 4,
    borderColor: '#F4C7D3',

    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarLetter: {
    fontSize: 36,
    fontWeight: '800',
    color: '#A66A4A',
  },

  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,

    borderWidth: 4,
    borderColor: '#F4C7D3',
  },

  pickImageButton: {
    marginTop: 12,

    backgroundColor: '#FFF5F8',

    borderWidth: 1,
    borderColor: '#F4C7D3',

    paddingHorizontal: 16,
    paddingVertical: 8,

    borderRadius: 999,
  },

  pickImageText: {
    color: '#D87495',
    fontWeight: '700',
    fontSize: 12,
  },

  label: {
    fontSize: 12,
    fontWeight: '700',

    color: '#8C6A52',

    marginBottom: 8,
    marginTop: 6,
  },

  input: {
    height: 52,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#EAD6C8',

    borderRadius: 14,

    paddingHorizontal: 14,

    marginBottom: 16,

    color: '#4A3628',
  },

  button: {
    height: 54,

    backgroundColor: '#F4A8B8',

    borderRadius: 16,

    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 12,
  },

  buttonText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 15,
  },

  loginText: {
    marginTop: 18,

    textAlign: 'center',

    color: '#D87495',

    fontWeight: '700',
    fontSize: 14,
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalCard: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },

  successIcon: {
    fontSize: 38,
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#6B4A34',
    marginBottom: 8,
  },

  modalMessage: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },

  modalButton: {
    backgroundColor: '#F4A8B8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },

  modalButtonText: {
    color: '#FFF',
    fontWeight: '700',
  },

});