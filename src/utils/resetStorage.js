
import AsyncStorage from '@react-native-async-storage/async-storage';

const RESET_KEY = '@classmark_test_data_reset_v1';

export async function resetTestStorageOnce() {
    const alreadyReset = await AsyncStorage.getItem(RESET_KEY);

    if (alreadyReset === 'done') {
        return;
    }

    await AsyncStorage.clear();
    await AsyncStorage.setItem(RESET_KEY, 'done');
}
