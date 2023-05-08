package com.lessons.utilities;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

public class PasswordEncrypter {
    private static final int SALT_LENGTH = 16;

    public static String hashPassword(String password) throws NoSuchAlgorithmException {
        SecureRandom random = new SecureRandom();
        byte[] salt = new byte[SALT_LENGTH];
        random.nextBytes(salt);

        MessageDigest md = MessageDigest.getInstance("SHA-256");
        md.update(salt);
        byte[] hashedPassword = md.digest(password.getBytes());

        // Combine the salt and hashed password into a single string
        String saltString = bytesToHex(salt);
        String hashedPasswordString = bytesToHex(hashedPassword);
        return saltString + ":" + hashedPasswordString;
    }

    public static boolean comparePasswords(String password, String hashedPassword) throws NoSuchAlgorithmException {
        String[] parts = hashedPassword.split(":");
        byte[] salt = hexToBytes(parts[0]);

        MessageDigest md = MessageDigest.getInstance("SHA-256");
        md.update(salt);
        byte[] hashedPasswordBytes = md.digest(password.getBytes());
        String hashedPasswordString = bytesToHex(hashedPasswordBytes);

        return hashedPasswordString.equals(parts[1]);
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    private static byte[] hexToBytes(String hex) {
        int length = hex.length();
        byte[] bytes = new byte[length / 2];
        for (int i = 0; i < length; i += 2) {
            bytes[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
                    + Character.digit(hex.charAt(i+1), 16));
        }
        return bytes;
    }
}