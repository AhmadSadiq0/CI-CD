// import { AppleMaps, GoogleMaps } from 'expo-maps';
import { StyleSheet, Text, View, Platform, Button, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as AgeRange from 'expo-age-range';

export default function App() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [, setExpoPushToken] = useState('');
  const [, setChannels] = useState<Notifications.NotificationChannel[]>([]);
  const [, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );
  const [result, setResult] = useState(null);

  const requestAgeRange = async () => {
    try {
      const ageRange = await AgeRange.requestAgeRangeAsync({
        threshold1: 10,
        threshold2: 13,
        threshold3: 18,
      });
      setResult(ageRange);
    } catch (error) {
      setResult({ error: error.message });
    }
  };

  const getUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
  };

  useEffect(() => {
    getUserLocation();

  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));

    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []));
    }
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    // });

    return () => {
      notificationListener.remove();
      // responseListener.remove();
    };
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('myNotificationChannel', {
        name: 'A channel is needed for the permissions prompt to appear',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert('Failed to get push token for push notification!');
        return;
      }
      // Learn more about projectId:
      // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
      // EAS projectId is used here.
      try {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
      } catch (e) {
        token = `${e}`;
      }
    } else {
      Alert.alert('Must use physical device for Push Notifications');
    }

    return token;
  }

  return (
    <View style={styles.container}>
      <Text>Location</Text>
      <Text>Lat:{location?.coords.latitude}</Text>
      <Text>Lat:{location?.coords.longitude}</Text>
      <Button title="Request Age Range" onPress={requestAgeRange} />
      {result && (
        <Text style={styles.result}>
          {'error' in result ? `Error: ${result.error}` : `Lower age bound: ${result.lowerBound}`}
        </Text>
      )}
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
