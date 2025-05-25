import { CommonActions } from '@react-navigation/native';
import Storage from './localStorage';

export const logout = async (navigation) => {
  try {
    await Storage.clearAll();

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    );
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
