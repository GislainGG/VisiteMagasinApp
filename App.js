import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MailComposer from 'expo-mail-composer';

export default function App() {
  const [form, setForm] = useState({ magasin: '', interlocuteur: '', date: '', actions: '', refus: '', suivi: '' });
  const [entries, setEntries] = useState([]);
  const [images, setImages] = useState([]);

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.5,
    });
    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const handleAddEntry = () => {
    if (!form.magasin || !form.date) return;
    const entry = { ...form, images };
    setEntries([...entries, entry]);
    setForm({ magasin: '', interlocuteur: '', date: '', actions: '', refus: '', suivi: '' });
    setImages([]);
  };

  const handleSendEmail = async () => {
    const body = entries.map((e, i) => \`---
Magasin : \${e.magasin}
Interlocuteur : \${e.interlocuteur}
Date : \${e.date}
✅ Actions : \${e.actions}
❌ Refus : \${e.refus}
🔁 Suivi : \${e.suivi}
\`).join('\n');

    const attachments = entries.flatMap(e => e.images || []);

    await MailComposer.composeAsync({
      recipients: ['tonadresse@mail.com'],
      subject: 'Compte rendu visites terrain',
      body,
      attachments,
    });
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Nouvelle visite</Text>
      <TextInput placeholder="Magasin" value={form.magasin} onChangeText={v => handleChange('magasin', v)} style={{ borderBottomWidth: 1, marginBottom: 8 }} />
      <TextInput placeholder="Interlocuteur" value={form.interlocuteur} onChangeText={v => handleChange('interlocuteur', v)} style={{ borderBottomWidth: 1, marginBottom: 8 }} />
      <TextInput placeholder="Date" value={form.date} onChangeText={v => handleChange('date', v)} style={{ borderBottomWidth: 1, marginBottom: 8 }} />
      <TextInput placeholder="✅ Actions réalisées" value={form.actions} onChangeText={v => handleChange('actions', v)} multiline style={{ borderWidth: 1, marginBottom: 8 }} />
      <TextInput placeholder="❌ Refus / limites" value={form.refus} onChangeText={v => handleChange('refus', v)} multiline style={{ borderWidth: 1, marginBottom: 8 }} />
      <TextInput placeholder="🔁 Suivi / prochaines étapes" value={form.suivi} onChangeText={v => handleChange('suivi', v)} multiline style={{ borderWidth: 1, marginBottom: 8 }} />
      <Button title="Ajouter une photo" onPress={pickImage} />
      <ScrollView horizontal>
        {images.map((uri, index) => (
          <Image key={index} source={{ uri }} style={{ width: 100, height: 100, margin: 4 }} />
        ))}
      </ScrollView>
      <Button title="Ajouter la fiche" onPress={handleAddEntry} />

      <Text style={{ fontSize: 20, marginTop: 16, fontWeight: 'bold' }}>Historique</Text>
      {entries.map((entry, idx) => (
        <View key={idx} style={{ borderWidth: 1, padding: 8, marginVertical: 4 }}>
          <Text>📍 {entry.magasin}</Text>
          <Text>👤 {entry.interlocuteur}</Text>
          <Text>📅 {entry.date}</Text>
          <Text>✅ {entry.actions}</Text>
          <Text>❌ {entry.refus}</Text>
          <Text>🔁 {entry.suivi}</Text>
          <ScrollView horizontal>
            {entry.images?.map((uri, i) => (
              <Image key={i} source={{ uri }} style={{ width: 80, height: 80, margin: 4 }} />
            ))}
          </ScrollView>
        </View>
      ))}

      {entries.length > 0 && (
        <TouchableOpacity style={{ marginTop: 16 }} onPress={handleSendEmail}>
          <View style={{ backgroundColor: '#2563eb', padding: 12, borderRadius: 6 }}>
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>📧 Envoyer par mail</Text>
          </View>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
