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
                console.log('Mensaje privado recibido:', data);
                
                // Guardar mensaje en la base de datos
                const savedMessage = await messageService.create(data);
                console.log('Mensaje guardado en la base de datos:', savedMessage);
                
                // Emitir el mensaje solo al remitente y al destinatario
                io.emit(`chat-${data.senderId}-${data.receiverId}`, data);
                io.emit(`chat-${data.receiverId}-${data.senderId}`, data);
                console.log(`Mensaje emitido a los canales chat-${data.senderId}-${data.receiverId} y chat-${data.receiverId}-${data.senderId}`);
                
                // Crear notificación para el destinatario
                console.log('Creando notificación para:', data.receiverId);
                const notification = await notificationService.createMessageNotification(data);
                console.log('Notificación creada:', notification);
                
                // Forzar la creación de una notificación si no se creó automáticamente
                if (!notification) {
                    console.log('Creando notificación manual ya que no se creó automáticamente');
                    const manualNotification = {
                        type: 'message',
                        title: 'Nuevo mensaje',
                        message: `Has recibido un nuevo mensaje`,
                        senderName: data.username || 'Usuario',
                        senderType: data.senderType || 'usuario',
                        senderId: data.senderId,
                        content: data.message.substring(0, 50) + (data.message.length > 50 ? '...' : ''),
                        timestamp: data.timestamp || new Date(),
                        read: false,
                        id: Date.now() + Math.floor(Math.random() * 1000)
                    };
                    
                    // Emitir notificación al destinatario
                    io.emit(`notifications-${data.receiverId}`, manualNotification);
                    console.log(`Notificación manual emitida al canal notifications-${data.receiverId}`);
                    
                    // Incrementar contador de notificaciones no leídas
                    await notificationService.addNotification(data.receiverId, manualNotification);
                    const unreadCount = await notificationService.countUnread(data.receiverId);
                    io.emit(`unread-count-${data.receiverId}`, { count: unreadCount + 1 });
                    console.log(`Contador de notificaciones no leídas emitido: ${unreadCount + 1}`);
                } else {
                    // Emitir notificación al destinatario
                    io.emit(`notifications-${data.receiverId}`, notification);
                    console.log(`Notificación emitida al canal notifications-${data.receiverId}`);
                    
                    // Emitir contador de notificaciones no leídas
                    const unreadCount = await notificationService.countUnread(data.receiverId);
                    io.emit(`unread-count-${data.receiverId}`, { count: unreadCount });
                    console.log(`Contador de notificaciones no leídas emitido: ${unreadCount}`);
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
                const { userId, notificationIds, senderId } = data;
                
                // Si se proporciona un senderId, marcar solo las notificaciones de ese remitente
                if (senderId) {
                    console.log(`Marcando como leídas las notificaciones de ${senderId} para ${userId}`);
                    
                    // Obtener todas las notificaciones del usuario
                    const allNotifications = await notificationService.getNotifications(userId);
                    
                    // Filtrar por remitente
                    const senderNotifications = allNotifications.filter(n => 
                        n.senderId === senderId && !n.read
                    );
                    
                    // Obtener los IDs
                    const idsToMark = senderNotifications.map(n => n.id);
                    
                    if (idsToMark.length > 0) {
                        await notificationService.markAsRead(userId, idsToMark);
                        console.log(`${idsToMark.length} notificaciones marcadas como leídas`);
                    }
                } else {
                    // Comportamiento original: marcar las notificaciones especificadas o todas si no se especifican
                    await notificationService.markAsRead(userId, notificationIds);
                }
                
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

        // Verificar mensajes no leídos entre dos usuarios
        socket.on('check-unread-messages', async (data) => {
            try {
                const { senderId, receiverId } = data;
                console.log(`Verificando mensajes no leídos de ${senderId} a ${receiverId}`);
                
                // Obtener todas las notificaciones del receptor
                const notifications = await notificationService.getNotifications(receiverId);
                
                // Filtrar solo las notificaciones de tipo mensaje del remitente específico
                const unreadMessages = notifications.filter(notif => 
                    notif.type === 'message' && 
                    notif.senderId === senderId && 
                    !notif.read
                );
                
                const count = unreadMessages.length;
                console.log(`${count} mensajes no leídos de ${senderId} a ${receiverId}`);
                
                // Emitir el contador al socket
                io.emit('unread-messages-count', { 
                    senderId, 
                    receiverId, 
                    count 
                });
            } catch (error) {
                console.error('Error al verificar mensajes no leídos:', error);
            }
        });
        
        // Reiniciar contador de mensajes no leídos entre dos usuarios
        socket.on('reset-unread-count', async (data) => {
            try {
                const { senderId, receiverId } = data;
                console.log(`Reiniciando contador de mensajes no leídos de ${senderId} a ${receiverId}`);
                
                // Obtener todas las notificaciones del receptor
                const notifications = await notificationService.getNotifications(receiverId);
                
                // Filtrar solo las notificaciones de tipo mensaje del remitente específico
                const messageNotifications = notifications.filter(notif => 
                    notif.type === 'message' && 
                    notif.senderId === senderId
                );
                
                // Obtener los IDs de las notificaciones
                const notificationIds = messageNotifications.map(notif => notif.id);
                
                // Marcar como leídas
                if (notificationIds.length > 0) {
                    await notificationService.markAsRead(receiverId, notificationIds);
                    console.log(`${notificationIds.length} notificaciones marcadas como leídas`);
                }
                
                // Emitir el contador actualizado (0) al socket
                io.emit('unread-messages-count', { 
                    senderId, 
                    receiverId, 
                    count: 0 
                });
                
                // Actualizar también el contador general de notificaciones
                const unreadCount = await notificationService.countUnread(receiverId);
                io.emit(`unread-count-${receiverId}`, { count: unreadCount });
            } catch (error) {
                console.error('Error al reiniciar contador de mensajes no leídos:', error);
            }
        });
    });
};
