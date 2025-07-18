import { NextRequest, NextResponse } from 'next/server';

// TURN server credentials endpoint
// This provides ICE servers configuration for WebRTC
export async function GET(request: NextRequest) {
  try {
    // Get TURN credentials from environment variables
    const turnUsername = process.env.TURN_USERNAME;
    const turnPassword = process.env.TURN_PASSWORD;
    
    if (!turnUsername || !turnPassword) {
      console.error('TURN credentials not configured in environment variables');
      // Fallback to STUN only if TURN not configured
      const iceServers = [
        // Public STUN servers
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
      ];
      
      return NextResponse.json({
        success: true,
        message: "ICE servers retrieved successfully (STUN only)",
        data: {
          iceServers,
          iceTransportPolicy: 'all'
        }
      });
    }

    // Complete ICE servers configuration with Metered TURN
    const iceServers = [
      // Public STUN servers
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      
      // Metered TURN servers (HTTPS compatible)
      {
        urls: 'turn:global.relay.metered.ca:80',
        username: turnUsername,
        credential: turnPassword
      },
      {
        urls: 'turn:global.relay.metered.ca:80?transport=tcp',
        username: turnUsername,
        credential: turnPassword
      },
      {
        urls: 'turn:global.relay.metered.ca:443',
        username: turnUsername,
        credential: turnPassword
      },
      {
        urls: 'turns:global.relay.metered.ca:443?transport=tcp',
        username: turnUsername,
        credential: turnPassword
      }
    ];

    return NextResponse.json({
      success: true,
      message: "ICE servers retrieved successfully",
      data: {
        iceServers,
        iceTransportPolicy: 'all', // 'relay' for TURN only, 'all' for STUN + TURN
        credentials: {
          username: turnUsername,
          password: turnPassword,
          ttl: 86400 // 24 hours
        }
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
