import { View, Pressable, Text, StyleSheet } from 'react-native';

type Props = {
  value: string;
  onChange: (duration: string) => void;
  step?: number;
  min?: number;
  max?: number;
};

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export default function DurationPickerInput({ value, onChange, step = 15, min = 15, max = 240 }: Props) {
  const minutes = Number(value) || 0;

  function handleDecrease() {
    onChange(String(Math.max(min, minutes - step)));
  }

  function handleIncrease() {
    const base = minutes > 0 ? minutes : min - step;
    onChange(String(Math.min(max, base + step)));
  }

  return (
    <View style={styles.input}>
      <Pressable style={styles.button} onPress={handleDecrease} hitSlop={8}>
        <Text style={styles.buttonText}>−</Text>
      </Pressable>
      <Text style={styles.text}>{minutes > 0 ? formatMinutes(minutes) : 'Select duration'}</Text>
      <Pressable style={styles.button} onPress={handleIncrease} hitSlop={8}>
        <Text style={styles.buttonText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#D8D8D8',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF5FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#185FA5',
  },
  text: {
    fontSize: 14,
    color: '#222',
  },
});
