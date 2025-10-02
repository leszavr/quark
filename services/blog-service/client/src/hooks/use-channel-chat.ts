import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { queryClient, apiRequest } from '@/lib/queryClient';

interface MessageData {
  id: string;
  channelId: string;
  authorId: string;
  content: string;
  messageType: string;
  attachments: string[] | null;
  createdAt: string;
  author: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
  } | null;
}

interface UseChannelChatOptions {
  channelId: string;
  enableWebSocket?: boolean;
}

export function useChannelChat({ channelId, enableWebSocket = false }: UseChannelChatOptions) {
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch messages for channel
  const { data: messages = [], isLoading, error } = useQuery({
    queryKey: ['/api/channels', channelId, 'messages'],
    enabled: !!channelId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { content: string; authorId: string; attachments?: string[]; messageType?: string }) => {
      return apiRequest('POST', `/api/channels/${channelId}/messages`, messageData);
    },
    onSuccess: () => {
      // Invalidate messages cache to refetch
      queryClient.invalidateQueries({
        queryKey: ['/api/channels', channelId, 'messages']
      });
    },
  });

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!enableWebSocket) return;

    const wsUrl = `ws://${window.location.host}`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_message' && data.data.channelId === channelId) {
          // Invalidate and refetch messages when new message arrives for this channel
          queryClient.invalidateQueries({
            queryKey: ['/api/channels', channelId, 'messages']
          });
        }
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [channelId, enableWebSocket]);

  const sendMessage = (content: string, authorId: string, attachments?: string[], messageType = 'text') => {
    return sendMessageMutation.mutate({
      content,
      authorId,
      attachments,
      messageType
    });
  };

  return {
    messages: messages as MessageData[],
    isLoading,
    error,
    sendMessage,
    isSending: sendMessageMutation.isPending,
  };
}