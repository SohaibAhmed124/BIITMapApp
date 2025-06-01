import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import Icon from "react-native-vector-icons/Ionicons";
import login from "../Api/AuthApi"; // adjust path if needed
import Storage from '../utils/localStorage';
import { useNavigation } from "@react-navigation/native";

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Validation Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password);
      await Storage.set("user", data.user);
      const user = await Storage.get("user");

      if (!user) {
        console.warn("User data not found in Storage!");
      }
      console.log(user);

      switch (data.user.role) {
        case "Admin":
          navigation.replace("AdminView");
          break;
        case "Manager":
          navigation.replace("ManagerSide");
          break;
        case "Employee":
          navigation.navigate("EmpSide");
          break;
        default:
          Alert.alert("Error", "Unknown user role");
      }
    } catch (error) {
      Alert.alert("Login Failed", error.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <Icon name="map" size={90} color="#fff" style={styles.icon} />
      <Text style={styles.title}>BIIT Map Server</Text>

      <View style={styles.card}>
        <TextInput
          mode="outlined"
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          left={<TextInput.Icon icon="email-outline" />}
          theme={inputTheme}
        />

        <TextInput
          mode="outlined"
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          style={styles.input}
          left={<TextInput.Icon icon="lock-outline" />}
          right={
            <TextInput.Icon
              icon={showPassword ? "eye-off-outline" : "eye-outline"}
              onPress={() => setShowPassword(!showPassword)}
            />
          }
          theme={inputTheme}
        />
        <Button
          mode="contained"
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
          labelStyle={styles.buttonLabel}
        >
          {loading ? <ActivityIndicator color="#fff" /> : "Login"}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const inputTheme = {
  colors: {
    primary: '#1976D2',     // active outline color
    outline: '#B0BEC5',     // default outline color
    background: '#FFFFFF',
    placeholder: '#90A4AE',
    text: '#263238',
  },
  roundness: 10,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2196F3",
    padding: 20,
    justifyContent: "center",
  },
  icon: {
    alignSelf: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 30,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  input: {
    marginBottom: 15,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 15,
  },
  forgotPasswordText: {
    color: "#1976D2",
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: "#1976D2",
    paddingVertical: 8,
    borderRadius: 10,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

export default LoginScreen;
