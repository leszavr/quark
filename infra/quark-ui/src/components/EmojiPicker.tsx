"use client";

import { Button } from "../../button";
import { IconButton } from "../../button";
// Остальные компоненты Chakra UI временно оставлены для поэтапной миграции
import { useState } from "react";
import { Smile } from "lucide-react";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  children?: React.ReactNode;
}

// Категории эмодзи
const emojiCategories = {
  smileys: {
    name: "Смайлики",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃",
      "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "☺️", "😚",
      "😙", "🥲", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭",
      "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄"
    ]
  },
  gestures: {
    name: "Жесты",
    emojis: [
      "👍", "👎", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙",
      "👈", "👉", "👆", "🖕", "👇", "☝️", "👋", "🤚", "🖐️", "✋",
      "🖖", "👏", "🙌", "🤲", "🤝", "🙏", "✍️", "💪", "🦵", "🦶"
    ]
  },
  objects: {
    name: "Объекты",
    emojis: [
      "💻", "📱", "⌚", "📷", "📹", "🎥", "📞", "☎️", "📠", "📺",
      "📻", "🎵", "🎶", "🎤", "🎧", "📢", "📣", "📯", "🔔", "🔕",
      "📪", "📫", "📬", "📭", "📮", "🗳️", "✏️", "✒️", "🖋️", "🖊️"
    ]
  },
  nature: {
    name: "Природа",
    emojis: [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯",
      "🦁", "🐮", "🐷", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒", "🐔",
      "🌸", "💐", "🌹", "🥀", "🌺", "🌻", "🌼", "🌷", "🌱", "🌲"
    ]
  },
  food: {
    name: "Еда",
    emojis: [
      "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈",
      "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦",
      "🥒", "🌶️", "🫑", "🌽", "🥕", "🫒", "🧄", "🧅", "🥔", "🍠"
    ]
  }
};

export function EmojiPicker({ onEmojiSelect, children }: EmojiPickerProps) {
  // Цветовая схема теперь через Tailwind dark: классы
  const colorMode = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const [selectedCategory, setSelectedCategory] = useState("smileys");

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
  };

  return (
    <div className="relative inline-block">
      {children || (
        <IconButton icon={<Smile size={18} />} aria-label="Выбрать эмодзи" className="text-gray-500 hover:text-secondary-500 p-2" />
      )}
      <div
        className={`absolute left-0 top-full mt-2 w-[320px] h-[280px] z-10 rounded-lg shadow-xl border ${colorMode === "dark" ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"}`}
      >
        <div className="flex flex-col h-full">
          {/* Категории */}
          <div className={`flex w-full p-2 border-b ${colorMode === "dark" ? "border-gray-600" : "border-gray-200"}`}>
            {Object.entries(emojiCategories).map(([key, category]) => (
              <Button
                key={key}
                className={`text-xs ${selectedCategory === key ? "font-bold text-primary-500 bg-black/5" : "font-normal text-gray-600"} flex-1 rounded-md hover:bg-black/5`}
                onClick={() => setSelectedCategory(key)}
              >
                {category.name}
              </Button>
            ))}
          </div>
          {/* Сетка эмодзи */}
          <div className="flex-1 w-full overflow-y-auto p-2">
            <div className="grid grid-cols-8 gap-1">
              {emojiCategories[selectedCategory as keyof typeof emojiCategories]?.emojis.map((emoji, index) => (
                <Button
                  key={`${emoji}-${index}`}
                  className="min-w-[32px] h-8 p-0 text-[16px] rounded-md hover:bg-black/10 transition-all duration-100 hover:scale-110"
                  onClick={() => handleEmojiClick(emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}