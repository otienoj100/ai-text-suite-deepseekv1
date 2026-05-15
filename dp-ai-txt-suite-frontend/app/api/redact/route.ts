// app/api/redact/route.ts
import { NextRequest, NextResponse } from 'next/server';

// The URL of your FastAPI backend
// Change this to your deployed backend URL later
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    // 1. Get the data sent from the frontend
    const body = await request.json();
    
    console.log('📤 Sending to backend:', body);
    
    // 2. Forward the request to your FastAPI backend
    const response = await fetch(`${BACKEND_URL}/api/redact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    // 3. Check if the backend request was successful
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Backend error:', errorData);
      return NextResponse.json(
        { error: errorData.detail || 'Backend processing failed' },
        { status: response.status }
      );
    }
    
    // 4. Get the response from backend
    const data = await response.json();
    console.log('✅ Backend response:', data);
    
    // 5. Return the response to the frontend
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('❌ Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend service' },
      { status: 500 }
    );
  }
}