import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={styles.container}>
      <Icon name="map" size={140} color="#fff" style={styles.icon}/>
      <Text style={styles.title}>Login</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          mode="outlined"
          placeholder="Enter your email here"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          mode="outlined"
          placeholder="Enter your password here"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <Button mode="contained" style={styles.loginButton}>
          Login
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2196F3",
    padding: 20,
    justifyContent: "center",
  },
  icon:{
    alignSelf:'center',
    marginHorizontal:20,
    bottom:70
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    marginBottom: 15,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 15,
  },
  forgotPasswordText: {
    color: "#2196F3",
  },
  loginButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 5,
  },
});

export default LoginScreen;
