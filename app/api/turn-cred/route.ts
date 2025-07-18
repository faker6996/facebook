import { NextRequest, NextResponse } from 'next/server';

// TURN server credentials endpoint
// This provides ICE servers configuration for WebRTC
export async function GET(request: NextRequest) {
  try {
    // TURN server credentials (static for this implementation)
    const credentials = {
      username: "adoria",
      password: "adoria@2025",
      ttl: 86400, // 24 hours
    };

    // Complete ICE servers configuration
    const iceServers = [
      // Public STUN servers
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      
      // Production TURN server
      {
        urls: 'turn:bachtv.ydns.eu:3478',
        username: credentials.username,
        credential: credentials.password
      },
      {
        urls: 'turns:bachtv.ydns.eu:5349',
        username: credentials.username,
        credential: credentials.password
      }
    ];

    return NextResponse.json({
      success: true,
      message: "ICE servers retrieved successfully",
      data: {
        iceServers,
        iceTransportPolicy: 'all', // 'relay' for TURN only, 'all' for STUN + TURN
        credentials // Legacy support
      }
    });
  } catch (error) {
    console.error('Error getting TURN credentials:', error);
    return NextResponse.json({
      success: false,
      message: "Failed to get ICE servers",
      data: null
    }, { status: 500 });
  }
}
