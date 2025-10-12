'use client';

import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Grid,
  useColorMode,
  IconButton,
} from '@chakra-ui/react';
import { useState } from 'react';
import { Smile } from 'lucide-react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  children?: React.ReactNode;
}

// Категории эмодзи
const emojiCategories = {
  smileys: {
    name: 'Смайлики',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
      '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚',
      '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭',
      '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄'
    ]
  },
  gestures: {
    name: 'Жесты',
    emojis: [
      '👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙',
      '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋',
      '🖖', '👏', '🙌', '🤲', '🤝', '🙏', '✍️', '💪', '🦵', '🦶'
    ]
  },
  objects: {
    name: 'Объекты',
    emojis: [
      '💻', '📱', '⌚', '📷', '📹', '🎥', '📞', '☎️', '📠', '📺',
      '📻', '🎵', '🎶', '🎤', '🎧', '📢', '📣', '📯', '🔔', '🔕',
      '📪', '📫', '📬', '📭', '📮', '🗳️', '✏️', '✒️', '🖋️', '🖊️'
    ]
  },
  nature: {
    name: 'Природа',
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
      '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔',
      '🌸', '💐', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', '🌲'
    ]
  },
  food: {
    name: 'Еда',
    emojis: [
      '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈',
      '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦',
      '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠'
    ]
  }
};

export function EmojiPicker({ onEmojiSelect, children }: EmojiPickerProps) {
  const { colorMode } = useColorMode();
  const [selectedCategory, setSelectedCategory] = useState('smileys');

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
  };

  return (
    <Popover placement="top-start">
      <PopoverTrigger>
        {children || (
          <IconButton
            aria-label="Выбрать эмодзи"
            icon={<Smile size={18} />}
            variant="ghost"
            size="sm"
            color="gray.500"
            _hover={{ color: 'secondary.500' }}
          />
        )}
      </PopoverTrigger>
      <PopoverContent 
        w="320px" 
        h="280px"
        bg={colorMode === 'dark' ? 'gray.800' : 'white'}
        borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
        shadow="xl"
      >
        <PopoverBody p={0}>
          <VStack spacing={0} h="full">
            {/* Категории */}
            <HStack
              spacing={0}
              w="full"
              p={2}
              borderBottom="1px solid"
              borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
            >
              {Object.entries(emojiCategories).map(([key, category]) => (
                <Button
                  key={key}
                  variant="ghost"
                  size="sm"
                  fontSize="xs"
                  fontWeight={selectedCategory === key ? 'bold' : 'normal'}
                  color={selectedCategory === key 
                    ? 'primary.500' 
                    : (colorMode === 'dark' ? 'gray.300' : 'gray.600')
                  }
                  bg={selectedCategory === key 
                    ? (colorMode === 'dark' ? 'whiteAlpha.100' : 'blackAlpha.50')
                    : 'transparent'
                  }
                  _hover={{
                    bg: colorMode === 'dark' ? 'whiteAlpha.100' : 'blackAlpha.50',
                  }}
                  onClick={() => setSelectedCategory(key)}
                  flex={1}
                  borderRadius="md"
                >
                  {category.name}
                </Button>
              ))}
            </HStack>

            {/* Сетка эмодзи */}
            <Box flex={1} w="full" overflowY="auto" p={2}>
              <Grid templateColumns="repeat(8, 1fr)" gap={1}>
                {emojiCategories[selectedCategory as keyof typeof emojiCategories]?.emojis.map((emoji, index) => (
                  <Button
                    key={`${emoji}-${index}`}
                    variant="ghost"
                    size="sm"
                    minW="32px"
                    h="32px"
                    p={0}
                    fontSize="16px"
                    borderRadius="md"
                    _hover={{
                      bg: colorMode === 'dark' ? 'whiteAlpha.200' : 'blackAlpha.100',
                      transform: 'scale(1.2)',
                    }}
                    transition="all 0.1s"
                    onClick={() => handleEmojiClick(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </Grid>
            </Box>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}