const MessageService = require('./services/messageService');
const NotificationService = require('./services/notificationService');
const messageService = new MessageService();
const notificationService = new NotificationService();

module.exports = (io) => {
    io.on('connection', async (socket) => {
        console.log("un nuevo usuario conectado");
        const messages = await messageService.getAll();
        io.emit('all-messages', messages);

        socket.on('writing', (username) => {
            socket.broadcast.emit('writing', username);
        });

        socket.on('new-message', async (data) => {
            await messageService.create(data);
            const messages = await messageService.getAll();
            io.emit('all-messages', messages);
        });

        // Manejar mensajes privados entre entrenador y cliente
        socket.on('private-message', async (data) => {
            try {
                // Guardar mensaje en la base de datos
                const savedMessage = await messageService.create(data);
                
                // Emitir el mensaje solo al remitente y al destinatario
                io.emit(`chat-${data.senderId}-${data.receiverId}`, data);
                io.emit(`chat-${data.receiverId}-${data.senderId}`, data);
                
                // Crear notificación para el destinatario
                const notification = await notificationService.createMessageNotification(data);
                if (notification) {
                    // Emitir notificación al destinatario
                    io.emit(`notifications-${data.receiverId}`, notification);
                    
                    // Emitir contador de notificaciones no leídas
                    const unreadCount = await notificationService.countUnread(data.receiverId);
                    io.emit(`unread-count-${data.receiverId}`, { count: unreadCount });
                }
                
                // Actualizar la lista de conversaciones para ambos usuarios
                const senderConversations = await messageService.getConversationsForUser(data.senderId);
                const receiverConversations = await messageService.getConversationsForUser(data.receiverId);
                
                io.emit(`conversations-${data.senderId}`, senderConversations);
                io.emit(`conversations-${data.receiverId}`, receiverConversations);
            } catch (error) {
                console.error('Error al enviar mensaje privado:', error);
            }
        });

        // Obtener conversación entre dos usuarios
        socket.on('get-conversation', async (data) => {
            try {
                const { user1Id, user2Id } = data;
                const conversation = await messageService.getConversation(user1Id, user2Id);
                socket.emit(`conversation-${user1Id}-${user2Id}`, conversation);
            } catch (error) {
                console.error('Error al obtener conversación:', error);
            }
        });

        // Obtener notificaciones para un usuario
        socket.on('get-notifications', async (data) => {
            try {
                const { userId } = data;
                const notifications = await notificationService.getNotifications(userId);
                socket.emit(`all-notifications-${userId}`, notifications);
                
                // Enviar también el contador de no leídas
                const unreadCount = await notificationService.countUnread(userId);
                socket.emit(`unread-count-${userId}`, { count: unreadCount });
            } catch (error) {
                console.error('Error al obtener notificaciones:', error);
            }
        });

        // Marcar notificaciones como leídas
        socket.on('mark-notifications-read', async (data) => {
            try {
                const { userId, notificationIds } = data;
                await notificationService.markAsRead(userId, notificationIds);
                
                // Enviar notificaciones actualizadas
                const notifications = await notificationService.getNotifications(userId);
                socket.emit(`all-notifications-${userId}`, notifications);
                
                // Actualizar contador de no leídas
                const unreadCount = await notificationService.countUnread(userId);
                socket.emit(`unread-count-${userId}`, { count: unreadCount });
            } catch (error) {
                console.error('Error al marcar notificaciones como leídas:', error);
            }
        });

        // Eliminar notificaciones
        socket.on('remove-notifications', async (data) => {
            try {
                const { userId, notificationIds } = data;
                await notificationService.removeNotifications(userId, notificationIds);
                
                // Enviar notificaciones actualizadas
                const notifications = await notificationService.getNotifications(userId);
                socket.emit(`all-notifications-${userId}`, notifications);
            } catch (error) {
                console.error('Error al eliminar notificaciones:', error);
            }
        });
    });
};
