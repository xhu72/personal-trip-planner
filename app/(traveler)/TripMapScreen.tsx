import MapView from 'react-native-maps';
import { StyleSheet, View } from 'react-native';

export default function TripMapScreen() {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider="google"
        initialRegion={{
          latitude:      43.6532,
          longitude:    -79.3832,
          latitudeDelta:  0.05,
          longitudeDelta: 0.05,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map:       { flex: 1 },
});