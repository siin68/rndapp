import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { room, event, data } = req.body;
    
    // Get io from the HTTP server
    const io = (res.socket as any)?.server?.io;
    
    if (!io) {
      console.warn('⚠️ [emit] Socket.IO not initialized on this request');
      return res.status(200).json({ success: false, reason: 'io not ready' });
    }

    console.log(`📤 [emit] Emitting '${event}' to ${room}`);
    io.to(room).emit(event, data);
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Socket emit error:', error);
    return res.status(500).json({ error: 'Failed to emit' });
  }
}
