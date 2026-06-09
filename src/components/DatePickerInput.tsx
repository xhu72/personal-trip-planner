import { useState } from 'react';
import { Pressable, Text, StyleSheet, Platform, Modal, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

type Props = {
  value: string;
  onChange: (date: string) => void;
  placeholder: string;
}

function toDate(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(value + 'T12:00:00');
  }
  return new Date();
}

function toYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function DatePickerInput({ value, onChange, placeholder}: Props) {
  const [show, setShow] = useState(false);
  const [pending, setPending] = useState<Date>(toDate(value));

  function handleChange(_: DateTimePickerEvent, date?: Date) {
    if (Platform.OS === 'android') {
      setShow(false);
      if (date) onChange(toYMD(date));
    } else {
      if (date) setPending(date);
    }
  }

  function handleDone() {
    onChange(toYMD(pending));
    setShow(false);
  }

  function handleOpen() {
    setPending(toDate(value));
    setShow(true);
  }

  return (
    <>
      <Pressable style={styles.input} onPress={handleOpen}>
        <Text style={[styles.text, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
        <Text style={styles.icon}>📅</Text>
      </Pressable>

      {Platform.OS === 'ios' ? (
        <Modal visible={show} transparent animationType="slide">
          <Pressable style={styles.backdrop} onPress={() => setShow(false)}>
            <Pressable style={styles.sheet} onPress={() => {}}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <Pressable onPress={() => setShow(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Text style={styles.sheetTitle}>Select date</Text>
                <Pressable onPress={handleDone}>
                  <Text style={styles.doneText}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                mode="date"
                display="spinner"
                value={pending}
                onChange={handleChange}
                style={styles.spinner}
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : (
        show && (
          <DateTimePicker
            mode="date"
            value={toDate(value)}
            onChange={handleChange}
          />
        )
      )}
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#D8D8D8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: {
    fontSize: 14,
    color: '#222',
  },
  placeholder: {
    color: '#aaa',
  },
  icon: {
    fontSize: 16,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D0D0D0',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E4E4E4',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A3C6B',
  },
  cancelText: {
    fontSize: 15,
    color: '#888',
    width: 60,
  },
  doneText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#185FA5',
    width: 60,
    textAlign: 'right',
  },
  spinner: {
    width: '100%',
  },
});
