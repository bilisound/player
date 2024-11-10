import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

export interface AddCustomProps {
  onSubmit: (content: string) => void;
}

export function AddCustom({ onSubmit }: AddCustomProps) {
  const [content, setContent] = useState("");

  function handleSubmit() {
    onSubmit(content);
    setContent("");
  }

  return (
    <View style={{ gap: 8 }}>
      <Text>Add custom track:</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TextInput
          style={{ flex: 1 }}
          value={content}
          onChangeText={(e) => {
            setContent(e);
          }}
        />
        <Button title="OK" onPress={handleSubmit} />
      </View>
    </View>
  );
}
