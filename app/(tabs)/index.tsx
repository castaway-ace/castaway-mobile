import { useTracks } from '@/services/useTracks';
import { ScrollView, StyleSheet, Text, View } from 'react-native';


export default function HomeScreen() {
  const { data, isLoading, isError, error } = useTracks();
  if (isError) return <Text>{error?.toString()}</Text>;
  if (isLoading) return <Text>Loading...</Text>;

  console.log(data);
  console.log(data?.pages)

  const tracks = data?.pages.flatMap((page) => page.data) ?? [];

  if (tracks.length === 0) return <Text>No tracks found</Text>;


  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff' }}>
      {tracks.map((track) => (
        <View key={track?.id || "1"}>
          <Text>{track?.title}</Text>
          <Text>{track?.duration}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
