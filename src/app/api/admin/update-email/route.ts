import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { oldEmail, newEmail, secret } = await request.json();
    
    // Simple secret check to prevent unauthorized access
    if (secret !== 'update-admin-email-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Find the user with old email
    const oldUser = await prisma.user.findUnique({
      where: { email: oldEmail }
    });
    
    if (!oldUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Update the email
    const updatedUser = await prisma.user.update({
      where: { email: oldEmail },
      data: { email: newEmail }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Email updated successfully',
      oldEmail,
      newEmail: updatedUser.email
    });
  } catch (error) {
    console.error('Error updating email:', error);
    return NextResponse.json({ error: 'Failed to update email' }, { status: 500 });
  }
}
