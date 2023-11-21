// FirebaseUtils.js
import auth from '@react-native-firebase/auth';

export const changePassword = async (email, currentPassword, newPassword) => {
  const user = auth().currentUser;

  try {
    // Reauthenticate the user with their current password
    const credentials = auth.EmailAuthProvider.credential(email, currentPassword);
    await user.reauthenticateWithCredential(credentials);

    // Change the password
    await user.updatePassword(newPassword);

    console.log('Password changed successfully');
    return true;
  } catch (error) {
    console.error('Error changing password:', error.message);
    return false;
  }
};
